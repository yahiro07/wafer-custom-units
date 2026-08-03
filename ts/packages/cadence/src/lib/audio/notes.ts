/**
 * Note tables and keyboard mapping for the playable keypad.
 *
 * One chromatic octave (C4..C5) laid out like a piano, with home-row and
 * upper-row keys mapped the classic web-keyboard way (white keys on the home
 * row, black keys on the row above).
 */
export interface Pad {
  note: string; // display name, e.g. "C4"
  midi: number; // MIDI note number
  key: string; // mapped keyboard key (lowercase)
  sharp: boolean; // black key?
}

/** Convert a MIDI note number to its frequency in Hz (A4 = 69 = 440 Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const PADS: Pad[] = [
  { note: "C4", midi: 60, key: "a", sharp: false },
  { note: "C#4", midi: 61, key: "w", sharp: true },
  { note: "D4", midi: 62, key: "s", sharp: false },
  { note: "D#4", midi: 63, key: "e", sharp: true },
  { note: "E4", midi: 64, key: "d", sharp: false },
  { note: "F4", midi: 65, key: "f", sharp: false },
  { note: "F#4", midi: 66, key: "t", sharp: true },
  { note: "G4", midi: 67, key: "g", sharp: false },
  { note: "G#4", midi: 68, key: "y", sharp: true },
  { note: "A4", midi: 69, key: "h", sharp: false },
  { note: "A#4", midi: 70, key: "u", sharp: true },
  { note: "B4", midi: 71, key: "j", sharp: false },
  { note: "C5", midi: 72, key: "k", sharp: false },
];

/** Fast lookup from a keyboard key to its MIDI note. */
export const KEY_TO_MIDI: Record<string, number> = Object.fromEntries(
  PADS.map((pad) => [pad.key, pad.midi]),
);
