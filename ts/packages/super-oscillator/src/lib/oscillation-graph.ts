import { Note, NoteLiteral } from 'tonal';
import Reverb, { ReverbNode } from 'soundbank-reverb';
import { CustomOscillatorType, customOscillators } from 'web-audio-oscillators';
import { queryUnitInterface } from 'wafer-host/unit-types';

export const unitInterface = queryUnitInterface('wafer-v01');

const MIDI_NOTE_MIN = 0;
const MIDI_NOTE_MAX = 127;
const GATE_ATTACK = 0.02;
const GATE_RELEASE = 0.01;

interface ActiveVoice {
  gate: GainNode;
  oscillator: OscillatorNode;
  releasing: boolean;
}

export class OscillationGraph {
  private readonly context: AudioContext;
  private readonly volume: GainNode;
  private readonly reverb: ReverbNode;
  private readonly activeVoices = new Map<number, ActiveVoice>();
  private oscillatorType: CustomOscillatorType = 'sawtooth';

  constructor() {
    this.context = unitInterface?.audioContext ?? new AudioContext();
    const audioDestination =
      unitInterface?.audioOutputNode ?? this.context.destination;

    this.reverb = Reverb(this.context);
    this.reverb.time = 1;
    this.reverb.wet.value = 0.8;
    this.reverb.dry.value = 0.6;
    this.reverb.connect(audioDestination);

    this.volume = this.context.createGain();
    this.volume.gain.value = 0.2; // TODO: Add UI control for this.
    this.volume.connect(this.reverb);
  }

  private setGateGain(
    noteGate: GainNode,
    value: number,
    timeConstant: number,
    time?: number,
  ): void {
    const when = time ?? noteGate.context.currentTime;
    noteGate.gain.cancelScheduledValues(when);
    noteGate.gain.setTargetAtTime(value, when, timeConstant);
  }

  private createVoice(midi: number, time?: number): ActiveVoice {
    const when = time ?? this.context.currentTime;
    const gate = this.context.createGain();
    gate.gain.setValueAtTime(0.0001, when);
    gate.connect(this.volume);

    const oscillator = customOscillators[this.oscillatorType](this.context);
    oscillator.frequency.value = Note.freq(
      Note.fromMidi(midi) as NoteLiteral,
    )!;
    oscillator.connect(gate);
    oscillator.start(when);

    return { gate, oscillator, releasing: false };
  }

  private disposeVoice(voice: ActiveVoice): void {
    voice.oscillator.onended = null;
    try {
      voice.oscillator.stop();
    } catch {
      // Oscillator may already be stopped.
    }
    try {
      voice.oscillator.disconnect();
      voice.gate.disconnect();
    } catch {
      // Nodes may already be detached.
    }
  }

  private startVoice(midi: number, time?: number): void {
    const existing = this.activeVoices.get(midi);
    if (existing) {
      this.disposeVoice(existing);
      this.activeVoices.delete(midi);
    }

    const voice = this.createVoice(midi, time);
    this.setGateGain(voice.gate, 1, GATE_ATTACK, time);
    this.activeVoices.set(midi, voice);
  }

  private stopVoice(midi: number, time?: number): void {
    const voice = this.activeVoices.get(midi);
    if (!voice || voice.releasing) {
      return;
    }
    voice.releasing = true;

    const when = time ?? this.context.currentTime;
    this.setGateGain(voice.gate, 0.0001, GATE_RELEASE, time);

    const stopTime = when + GATE_RELEASE * 5 + 0.05;
    voice.oscillator.stop(stopTime);
    voice.oscillator.onended = () => {
      if (this.activeVoices.get(midi) === voice) {
        this.activeVoices.delete(midi);
      }
      this.disposeVoice(voice);
    };
  }

  /**
   * Open a note's gate, allowing its connected oscillator to be heard.
   */
  openNoteGate(note: NoteLiteral, time?: number): void {
    const midi = Note.midi(note);
    if (typeof midi !== 'number') {
      return;
    }
    this.startVoice(midi, time);
  }

  /**
   * Close a note's gate, effectively muting its connected oscillator.
   */
  closeNoteGate(note: NoteLiteral, time?: number): void {
    const midi = Note.midi(note);
    if (typeof midi !== 'number') {
      return;
    }
    this.stopVoice(midi, time);
  }

  /** Open a note gate by MIDI number (host note input). */
  openNoteGateByMidi(noteNumber: number, time?: number): void {
    if (noteNumber < MIDI_NOTE_MIN || noteNumber > MIDI_NOTE_MAX) {
      return;
    }
    this.startVoice(noteNumber, time);
  }

  /** Close a note gate by MIDI number (host note input). */
  closeNoteGateByMidi(noteNumber: number, time?: number): void {
    if (noteNumber < MIDI_NOTE_MIN || noteNumber > MIDI_NOTE_MAX) {
      return;
    }
    this.stopVoice(noteNumber, time);
  }

  /** Change the connected oscillator type for currently sounding notes. */
  setOscillatorType(oscillatorType: CustomOscillatorType): void {
    this.oscillatorType = oscillatorType;
    for (const [midi, voice] of this.activeVoices) {
      if (voice.releasing) {
        continue;
      }
      const when = this.context.currentTime;
      voice.oscillator.onended = null;
      try {
        voice.oscillator.stop();
        voice.oscillator.disconnect(voice.gate);
      } catch {
        // Ignore nodes that are already stopped or detached.
      }

      const oscillator = customOscillators[oscillatorType](this.context);
      oscillator.frequency.value = Note.freq(
        Note.fromMidi(midi) as NoteLiteral,
      )!;
      oscillator.connect(voice.gate);
      oscillator.start(when);
      voice.oscillator = oscillator;
    }
  }
}
