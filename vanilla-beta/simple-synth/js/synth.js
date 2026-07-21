var Synth = {};

const waferToneSynthBridge = createWaferToneSynthBridge();

document.addEventListener("DOMContentLoaded", function (event) {
  "use strict";

  window.synth = new Synth.Instrument().connect(
    waferToneSynthBridge.destinationNode,
  );
  Synth.UI(window.synth);

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
  });

  // iOS support
  StartAudioContext(Tone.context, "#piano *");
});
