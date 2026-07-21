var Synth = {};

const waferToneSynthBridge = createWaferToneSynthBridge();

document.addEventListener("DOMContentLoaded", function (event) {
  "use strict";

  window.synth = new Synth.Instrument().connect(
    waferToneSynthBridge.destinationNode,
  );
  var controls = Synth.UI(window.synth);
  var persistence = Synth.createPersistence(controls);

  waferToneSynthBridge.unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      viewSize: [810, 410],
    },
    noteInput: waferToneSynthBridge.createNotePortAdapted({
      triggerAttack(freq, time, velocity) {
        window.synth.triggerAttack(freq, time, velocity);
      },
      triggerRelease(time) {
        window.synth.triggerRelease(time);
      },
    }),
    persistence: {
      emitState: persistence.emitState,
      applyState: persistence.applyState,
    },
  });

  // iOS support
  StartAudioContext(Tone.context, "#piano *");
});
