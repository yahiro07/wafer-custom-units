import { Voice } from "@/lib/audio/voice";
import type { EngineParams } from "@/lib/audio/types";
import { queryUnitInterface } from "wafer-host/unit-types";
import { midiToFreq } from "@/lib/audio/notes";
import { WAVEFORMS } from "@/lib/constants";

export const unitInterface = queryUnitInterface("wafer-v01");

/** Float fields serialized after the waveform index byte (little-endian f32). */
const PARAM_FLOAT_KEYS = [
  "cutoff",
  "resonance",
  "delayTime",
  "delayFeedback",
  "volume",
  "attack",
  "decay",
  "sustain",
  "release",
] as const satisfies ReadonlyArray<keyof EngineParams>;

const STATE_BYTE_LENGTH = 1 + PARAM_FLOAT_KEYS.length * 4;

function encodeEngineParams(params: EngineParams): Uint8Array {
  const bytes = new Uint8Array(STATE_BYTE_LENGTH);
  const view = new DataView(bytes.buffer);
  const waveIndex = WAVEFORMS.indexOf(params.waveform);
  bytes[0] = waveIndex < 0 ? 0 : waveIndex;
  let offset = 1;
  for (const key of PARAM_FLOAT_KEYS) {
    view.setFloat32(offset, params[key], true);
    offset += 4;
  }
  return bytes;
}

function decodeEngineParams(stateBytes: Uint8Array): EngineParams | null {
  if (stateBytes.length !== STATE_BYTE_LENGTH) {
    return null;
  }
  const waveform = WAVEFORMS[stateBytes[0]];
  if (!waveform) {
    return null;
  }
  const view = new DataView(
    stateBytes.buffer,
    stateBytes.byteOffset,
    stateBytes.byteLength,
  );
  const params = { waveform } as EngineParams;
  let offset = 1;
  for (const key of PARAM_FLOAT_KEYS) {
    const value = view.getFloat32(offset, true);
    if (!Number.isFinite(value)) {
      return null;
    }
    params[key] = value;
    offset += 4;
  }
  return params;
}

/**
 * The cadence synth engine. Owns the AudioContext and a hand-wired signal
 * graph:
 *
 *   voices -> voiceBus -> filter -> master (dry)
 *                              \--> delay -> wet -> master
 *                                     ^--- feedback ---|
 *   master -> analyser -> destination
 *
 * The analyser is the tap the visualizer reads from. The context is created
 * lazily by the hook on a user gesture, satisfying browser autoplay policy.
 */
export class AudioEngine {
  readonly ctx: AudioContext;

  private readonly voiceBus: GainNode;
  private readonly filter: BiquadFilterNode;
  private readonly delay: DelayNode;
  private readonly feedback: GainNode;
  private readonly wet: GainNode;
  private readonly master: GainNode;
  private readonly analyser: AnalyserNode;

  private params: EngineParams;
  private readonly voices = new Map<string, Voice>();
  private readonly onParamsChange?: (params: EngineParams) => void;

  constructor(
    params: EngineParams,
    onParamsChange?: (params: EngineParams) => void,
  ) {
    this.ctx = unitInterface?.audioContext ?? new AudioContext();
    const destinationNode =
      unitInterface?.audioOutputNode ?? this.ctx.destination;

    this.params = params;
    this.onParamsChange = onParamsChange;

    this.voiceBus = this.ctx.createGain();
    this.filter = this.ctx.createBiquadFilter();
    this.delay = this.ctx.createDelay(1.5);
    this.feedback = this.ctx.createGain();
    this.wet = this.ctx.createGain();
    this.master = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();

    this.filter.type = "lowpass";
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Dry path.
    this.voiceBus.connect(this.filter);
    this.filter.connect(this.master);
    // Wet (delay) path with feedback loop.
    this.filter.connect(this.delay);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.wet);
    this.wet.connect(this.master);
    // Output tap.
    this.master.connect(this.analyser);
    this.analyser.connect(destinationNode);

    this.applyParams(params);

    const self = this;
    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "instrument",
        viewSize: [1120, 775],
      },
      noteInput: {
        noteOn(noteNumber, time) {
          const id = `note-${noteNumber}`;
          const freq = midiToFreq(noteNumber);
          self.noteOn(id, freq, time);
        },
        noteOff(noteNumber, time) {
          const id = `note-${noteNumber}`;
          self.noteOff(id, time);
        },
      },
      persistence: {
        emitStateBytes() {
          return self.emitStateBytes();
        },
        applyStateBytes(stateBytes) {
          self.applyStateBytes(stateBytes);
        },
      },
    });
  }

  /** Serialize live engine params for the host persistence layer. */
  emitStateBytes(): Uint8Array {
    return encodeEngineParams(this.params);
  }

  /** Restore params from the host; updates audio nodes and notifies React. */
  applyStateBytes(stateBytes: Uint8Array): void {
    const next = decodeEngineParams(stateBytes);
    if (!next) {
      return;
    }
    this.setParams(next);
    this.onParamsChange?.(next);
  }

  /** Smoothly push parameter values onto the live audio nodes. */
  private applyParams(p: EngineParams): void {
    const now = this.ctx.currentTime;
    const tau = 0.01;
    this.filter.frequency.setTargetAtTime(p.cutoff, now, tau);
    this.filter.Q.setTargetAtTime(p.resonance, now, tau);
    this.delay.delayTime.setTargetAtTime(p.delayTime, now, tau);
    this.feedback.gain.setTargetAtTime(p.delayFeedback, now, tau);
    this.wet.gain.setTargetAtTime(p.delayFeedback, now, tau);
    this.master.gain.setTargetAtTime(p.volume, now, tau);
  }

  /** Resume a suspended context (call inside a user gesture). */
  async resume(): Promise<void> {
    if (
      this.ctx !== unitInterface?.audioContext &&
      this.ctx.state === "suspended"
    ) {
      await this.ctx.resume();
    }
  }

  setParams(params: EngineParams): void {
    this.params = params;
    this.applyParams(params);
    for (const voice of this.voices.values()) {
      voice.setWaveform(params.waveform);
    }
  }

  /** Start a note keyed by a stable id; re-triggers replace the prior voice. */
  noteOn(id: string, frequency: number, time?: number): void {
    const existing = this.voices.get(id);
    if (existing) {
      existing.dispose();
      this.voices.delete(id);
    }
    const when = time ?? this.ctx.currentTime;
    const voice = new Voice(
      this.ctx,
      this.voiceBus,
      frequency,
      this.params,
      when,
    );
    voice.onEnded(() => {
      if (this.voices.get(id) !== voice) {
        return;
      }
      voice.dispose();
      this.voices.delete(id);
    });
    this.voices.set(id, voice);
  }

  /** Release a held note into its envelope tail. */
  noteOff(id: string, time?: number): void {
    const voice = this.voices.get(id);
    if (!voice) {
      return;
    }
    voice.release(this.params.release, time ?? this.ctx.currentTime);
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /** Release everything and close the context. */
  dispose(): void {
    for (const voice of this.voices.values()) {
      voice.dispose();
    }
    this.voices.clear();
    this.ctx.close().catch(() => {
      // Closing an already-closed context throws; ignore.
    });
  }
}
