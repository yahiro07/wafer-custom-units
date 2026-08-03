import { SynthoEngine } from "./audio/engine";
import { FrequencyMap } from "./audio/frequency-map";
import { Vco } from "./audio/vco";

export function createNoteRoute(
  engine: SynthoEngine,
  frequencyMap: FrequencyMap,
) {
  let lastNoteNumber = 0;

  function affectVcoFrequency(vco: Vco, noteNumber: number, time?: number) {
    const relOctave = vco.octave - 4;
    const note = noteNumber + relOctave * 12;
    vco.setFrequency(frequencyMap.getFrequency(note), time);
  }

  return {
    noteOn(noteNumber: number, time?: number) {
      affectVcoFrequency(engine.vco1, noteNumber, time);
      affectVcoFrequency(engine.vco2, noteNumber, time);
      affectVcoFrequency(engine.vco3, noteNumber, time);
      engine.trigger(1, time);
      lastNoteNumber = noteNumber;
    },
    noteOff(noteNumber: number, time?: number) {
      if (noteNumber === lastNoteNumber) {
        engine.trigger(0, time);
        lastNoteNumber = -1;
      }
    },
  };
}
