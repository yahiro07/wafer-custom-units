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
        if (note >= conf.basenote && note < conf.basenote + conf.num_note) {
          m.noteOn(note, 100, time);
        }
      },
      noteOff(note, time) {
        if (note >= conf.basenote && note < conf.basenote + conf.num_note) {
          m.noteOff(note, time);
        }
      },
    },
    // persistence: {
    //   emitState() {
    //     return ctrl.getParameters();
    //   },
    //   applyState(states) {
    //     ctrl.setParameters(states);
    //   },
    // },
    // automationInput,
  });
}
setupWaferUnit();
