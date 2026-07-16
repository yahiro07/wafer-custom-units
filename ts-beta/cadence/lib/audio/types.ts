/**
 * Shared audio types for the cadence synth engine.
 */

// The four standard periodic waveforms a Web Audio OscillatorNode can produce.
export type WaveType = OscillatorType; // "sine" | "square" | "sawtooth" | "triangle"

export interface EngineParams {
  waveform: WaveType;
  cutoff: number; // low-pass filter cutoff, Hz
  resonance: number; // filter Q
  delayTime: number; // delay line time, seconds
  delayFeedback: number; // delay feedback amount, 0..~0.9
  volume: number; // master gain, 0..1
  attack: number; // envelope attack, seconds
  decay: number; // envelope decay, seconds
  sustain: number; // envelope sustain level, 0..1
  release: number; // envelope release, seconds
}
