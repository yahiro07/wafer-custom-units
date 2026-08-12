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
    presetProvider: {
      getPresetNames() {
        const presetNames = [...Object.keys(presetData), "$reset", "$random"];
        if (location.href.includes("localhost")) {
          presetNames.push("$dump");
        }
        return presetNames;
      },
      applyPreset(presetName) {
        if (presetName === "$reset") {
          applyPersistedState(basePreset);
        } else if (presetName === "$random") {
          const preset = generateRandomPreset();
          ctrl.setParameters(preset);
        } else if (presetName === "$dump") {
          const preset = ctrl.getParameters();
          console.log(JSON.stringify(preset, null, 2));
        } else {
          const preset = presetData[presetName];
          if (preset) {
            ctrl.setParameters(preset);
          }
        }
      },
    },
  });
}
$(function () {
  setupWaferUnit();
});
