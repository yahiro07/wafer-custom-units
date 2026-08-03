function setupWaferUnit() {
  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      categoryHint: "synthesizer",
      viewSize: [700, 400],
    },
    noteInput: {
      noteOn(noteNumber, time) {
        ctrl.note_on(noteNumber, time);
      },
      noteOff(noteNumber, time) {
        ctrl.note_off(noteNumber, time);
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
