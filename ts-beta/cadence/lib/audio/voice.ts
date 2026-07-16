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
  private released = false;

  constructor(
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    params: EngineParams,
  ) {
    this.ctx = ctx;
    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();

    this.osc.type = params.waveform;
    this.osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    this.osc.connect(this.gain);
    this.gain.connect(destination);

    // Attack -> Decay -> Sustain. Times are floored to avoid zero-length ramps,
    // which some engines reject. Peak is below 1.0 to leave polyphonic headroom.
    const now = ctx.currentTime;
    const peak = 0.85;
    const attack = Math.max(params.attack, 0.001);
    const decay = Math.max(params.decay, 0.001);
    const sustain = peak * Math.min(Math.max(params.sustain, 0), 1);

    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(0.0001, now);
    this.gain.gain.linearRampToValueAtTime(peak, now + attack);
    this.gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    this.osc.start(now);
  }

  /** Live-update the waveform on a held note (slider moved while playing). */
  setWaveform(waveform: WaveType): void {
    this.osc.type = waveform;
  }

  /** Begin the release tail; the oscillator stops once it has faded out. */
  release(releaseSeconds: number): void {
    if (this.released) {
      return;
    }
    this.released = true;
    const now = this.ctx.currentTime;
    const release = Math.max(releaseSeconds, 0.001);
    const current = this.gain.gain.value;

    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(current, now);
    this.gain.gain.linearRampToValueAtTime(0.0001, now + release);
    this.osc.stop(now + release + 0.05);
  }

  /** Register a callback fired when the oscillator has fully stopped. */
  onEnded(callback: () => void): void {
    this.osc.onended = callback;
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
