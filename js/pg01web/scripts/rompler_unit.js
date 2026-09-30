function setupWaferUnit() {
  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      categoryHint: "synthesizer",
      viewSize: [670, 360],
      preferJustSize: true,
    },
    noteInput: {
      noteOn(note, time) {
        if (28 <= note && note < 39) {
          m.noteOn(note + 12, 50, time);
        } else if (40 <= note && note < 53) {
          m.noteOn(note, 100, time);
        }
      },
      noteOff(note, time) {
        if (28 <= note && note < 39) {
          m.noteOff(note + 12, time);
        } else if (40 <= note && note < 53) {
          m.noteOff(note, time);
        }
      },
    },
  });
}
setupWaferUnit();
