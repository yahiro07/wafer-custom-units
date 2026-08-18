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
    automationInput,
    presetProvider: {
      getPresetNames() {
        return Object.keys(presetData);
      },
      applyPreset(presetName) {
        const preset = presetData[presetName];
        if (preset) {
          ctrl.setParameters(preset);
        }
      },
      getCommandNames() {
        const commandNames = ["init", "random"];
        if (location.href.includes("localhost")) {
          commandNames.push("dump");
        }
        return commandNames;
      },
      applyCommand(commandName) {
        if (commandName === "init") {
          ctrl.setParameters(basePreset);
          return true;
        } else if (commandName === "random") {
          const preset = generateRandomPreset();
          ctrl.setParameters(preset);
          return true;
        } else if (commandName === "dump") {
          const preset = ctrl.getParameters();
          console.log(JSON.stringify(preset, null, 2));
        }
      },
    },
  });
}
$(function () {
  setupWaferUnit();
});
