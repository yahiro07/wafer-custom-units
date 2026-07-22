import type { EngineParams, WaveType } from "@/lib/audio/types";

/**
 * A single polyphonic voice: one oscillator shaped by an ADSR amplitude
 * envelope, routed into the engine's voice bus. Each note press creates its
 * own Voice so chords stack and release independently.
 */
export class Voice {
  private readonly ctx: AudioContext;
  private readonly osc: OscillatorNode;
  private readonly gain: GainNode;
  private readonly startTime: number;
  private readonly peak: number;
  private readonly attack: number;
  private readonly decay: number;
  private readonly sustain: number;
  private released = false;

  constructor(
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    params: EngineParams,
    time: number = ctx.currentTime,
  ) {
    this.ctx = ctx;
    this.startTime = time;
    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();

    this.osc.type = params.waveform;
    this.osc.frequency.setValueAtTime(frequency, time);
    this.osc.connect(this.gain);
    this.gain.connect(destination);

    // Attack -> Decay -> Sustain. Times are floored to avoid zero-length ramps,
    // which some engines reject. Peak is below 1.0 to leave polyphonic headroom.
    this.peak = 0.85;
    this.attack = Math.max(params.attack, 0.001);
    this.decay = Math.max(params.decay, 0.001);
    this.sustain = this.peak * Math.min(Math.max(params.sustain, 0), 1);

    this.gain.gain.cancelScheduledValues(time);
    this.gain.gain.setValueAtTime(0.0001, time);
    this.gain.gain.linearRampToValueAtTime(this.peak, time + this.attack);
    this.gain.gain.linearRampToValueAtTime(
      this.sustain,
      time + this.attack + this.decay,
    );

    this.osc.start(time);
  }

  /** Live-update the waveform on a held note (slider moved while playing). */
  setWaveform(waveform: WaveType): void {
    this.osc.type = waveform;
  }

  /** Begin the release tail; the oscillator stops once it has faded out. */
  release(releaseSeconds: number, time: number = this.ctx.currentTime): void {
    if (this.released) {
      return;
    }
    this.released = true;
    const release = Math.max(releaseSeconds, 0.001);
    const current = this.gainAtTime(time);

    this.gain.gain.cancelScheduledValues(time);
    this.gain.gain.setValueAtTime(current, time);
    this.gain.gain.linearRampToValueAtTime(0.0001, time + release);
    this.osc.stop(time + release + 0.05);
  }

  /** Register a callback fired when the oscillator has fully stopped. */
  onEnded(callback: () => void): void {
    this.osc.onended = callback;
  }

  private gainAtTime(time: number): number {
    const elapsed = time - this.startTime;
    if (elapsed <= 0) {
      return 0.0001;
    }
    if (elapsed <= this.attack) {
      const t = elapsed / this.attack;
      return 0.0001 + (this.peak - 0.0001) * t;
    }
    if (elapsed <= this.attack + this.decay) {
      const t = (elapsed - this.attack) / this.decay;
      return this.peak + (this.sustain - this.peak) * t;
    }
    return this.sustain;
  }

  /** Detach this voice's nodes from the graph. */
  dispose(): void {
    try {
      this.osc.disconnect();
      this.gain.disconnect();
    } catch {
      // Nodes may already be detached; ignore.
    }
  }
}
