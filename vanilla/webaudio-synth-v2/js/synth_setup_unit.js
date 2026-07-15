function setupWaferUnit() {
  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      categoryHint: "synthesizer",
      outputs: ["audio"],
      inputs: ["note"],
      viewSize: [700, 400],
    },
    noteInput: {
      noteOn(noteNumber) {
        ctrl.note_on(noteNumber);
      },
      noteOff(noteNumber) {
        ctrl.note_off(noteNumber);
      },
    },
    persistence: {
      emitState() {
        return ctrl.getParameters();
      },
      applyState(states) {
        ctrl.setParameters(states);
      },
    },
  });
}
$(function () {
  setupWaferUnit();
});
