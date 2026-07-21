import { SynthoEngine } from "./audio/engine";
import { FrequencyMap } from "./audio/frequency-map";
import { Vco } from "./audio/vco";

export function createNoteRoute(
  engine: SynthoEngine,
  frequencyMap: FrequencyMap,
) {
  let lastNoteNumber = 0;

  function affectVcoFrequency(vco: Vco, noteNumber: number) {
    const relOctave = vco.octave - 4;
    const note = noteNumber + relOctave * 12;
    vco.frequency = frequencyMap.getFrequency(note);
  }

  return {
    noteOn(noteNumber: number) {
      affectVcoFrequency(engine.vco1, noteNumber);
      affectVcoFrequency(engine.vco2, noteNumber);
      affectVcoFrequency(engine.vco3, noteNumber);
      engine.trigger(1);
      lastNoteNumber = noteNumber;
    },
    noteOff(noteNumber: number) {
      if (noteNumber === lastNoteNumber) {
        engine.trigger(0);
        lastNoteNumber = -1;
      }
    },
  };
}
