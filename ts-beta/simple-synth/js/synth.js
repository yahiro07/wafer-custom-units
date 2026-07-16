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
      outputs: ["audio"],
      inputs: ["note"],
      viewSize: [810, 410],
    },
    noteInput: waferToneSynthBridge.createNotePortAdapted({
      triggerAttack(freq) {
        window.synth.triggerAttack(freq);
      },
      triggerRelease() {
        window.synth.triggerAttack();
      },
    }),
  });

  // iOS support
  StartAudioContext(Tone.context, "#piano *");
});
