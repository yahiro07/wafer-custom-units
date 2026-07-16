import { Voice } from "@/lib/audio/voice";
import type { EngineParams } from "@/lib/audio/types";
import { queryUnitInterface } from "wafer-host/unit-types";
import { midiToFreq } from "@/lib/audio/notes";

export const unitInterface = queryUnitInterface("wafer-v01");

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

  constructor(params: EngineParams) {
    this.ctx = unitInterface?.audioContext ?? new AudioContext();
    const destinationNode =
      unitInterface?.audioOutputNode ?? this.ctx.destination;

    this.params = params;

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
        outputs: ["audio"],
        inputs: ["note"],
        viewSize: [1120, 775],
      },
      noteInput: {
        noteOn(noteNumber) {
          const id = `note-${noteNumber}`;
          const freq = midiToFreq(noteNumber);
          self.noteOn(id, freq);
        },
        noteOff(noteNumber) {
          const id = `note-${noteNumber}`;
          self.noteOff(id);
        },
      },
    });
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

  /** Start a note keyed by a stable id (ignores re-triggers of a held note). */
  noteOn(id: string, frequency: number): void {
    if (this.voices.has(id)) {
      return;
    }
    const voice = new Voice(this.ctx, this.voiceBus, frequency, this.params);
    voice.onEnded(() => {
      voice.dispose();
      this.voices.delete(id);
    });
    this.voices.set(id, voice);
  }

  /** Release a held note into its envelope tail. */
  noteOff(id: string): void {
    const voice = this.voices.get(id);
    if (!voice) {
      return;
    }
    voice.release(this.params.release);
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
