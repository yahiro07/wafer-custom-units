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
        if (52 <= note && note <= 63) {
          m.noteOn(note - 12, 50, time);
        } else if (64 <= note && note <= 76) {
          m.noteOn(note - 24, 100, time);
        }
      },
      noteOff(note, time) {
        if (52 <= note && note <= 63) {
          m.noteOff(note - 12, time);
        } else if (64 <= note && note <= 76) {
          m.noteOff(note - 24, time);
        }
      },
    },
  });
}
setupWaferUnit();
