(function () {
  "use strict";

  var OSC_TYPES = ["sine", "triangle", "sawtooth", "square"];
  var FILTER_TYPES = ["lowpass", "highpass", "bandpass", "notch"];
  var LFO_TYPES = ["sine", "triangle", "sawtooth", "square"];

  function getDefaultParameters() {
    return {
      oscType: "sawtooth",
      oscDetune: 0,
      oscPortamento: 0,
      filterType: "lowpass",
      filterFreq: 0.5,
      filterQ: 0,
      envelopeAttack: 0.01,
      envelopeDecay: 0.01,
      envelopeSustain: 1,
      envelopeRelease: 0.01,
      lfoType: "sine",
      lfoRate: 0,
      lfoPitch: 0,
      lfoFilter: 0,
    };
  }

  function serializableNumber(value, fallback) {
    var number = typeof value === "number" ? value : parseFloat(value);
    return isNaN(number) ? fallback : number;
  }

  function serializableOption(value, options, fallback) {
    return options.indexOf(value) >= 0 ? value : fallback;
  }

  function parsePersistedState(state) {
    if (!state || typeof state !== "object") return null;

    var parameters = state.parameters;
    if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
      if (typeof state.oscType === "string") {
        parameters = state;
      } else {
        return null;
      }
    }

    var defaults = getDefaultParameters();
    return {
      oscType: serializableOption(parameters.oscType, OSC_TYPES, defaults.oscType),
      oscDetune: serializableNumber(parameters.oscDetune, defaults.oscDetune),
      oscPortamento: serializableNumber(
        parameters.oscPortamento,
        defaults.oscPortamento,
      ),
      filterType: serializableOption(
        parameters.filterType,
        FILTER_TYPES,
        defaults.filterType,
      ),
      filterFreq: serializableNumber(parameters.filterFreq, defaults.filterFreq),
      filterQ: serializableNumber(parameters.filterQ, defaults.filterQ),
      envelopeAttack: serializableNumber(
        parameters.envelopeAttack,
        defaults.envelopeAttack,
      ),
      envelopeDecay: serializableNumber(
        parameters.envelopeDecay,
        defaults.envelopeDecay,
      ),
      envelopeSustain: serializableNumber(
        parameters.envelopeSustain,
        defaults.envelopeSustain,
      ),
      envelopeRelease: serializableNumber(
        parameters.envelopeRelease,
        defaults.envelopeRelease,
      ),
      lfoType: serializableOption(parameters.lfoType, LFO_TYPES, defaults.lfoType),
      lfoRate: serializableNumber(parameters.lfoRate, defaults.lfoRate),
      lfoPitch: serializableNumber(parameters.lfoPitch, defaults.lfoPitch),
      lfoFilter: serializableNumber(parameters.lfoFilter, defaults.lfoFilter),
    };
  }

  function setControlValue(control, value) {
    if (!control || value === undefined) return;
    control.value = value;
  }

  Synth.createPersistence = function (controls) {
    return {
      emitState: function () {
        var defaults = getDefaultParameters();
        return {
          parameters: {
            oscType: controls["osc-type"]
              ? controls["osc-type"].value
              : defaults.oscType,
            oscDetune: controls["osc-detune"]
              ? controls["osc-detune"].value
              : defaults.oscDetune,
            oscPortamento: controls["osc-portamento"]
              ? controls["osc-portamento"].value
              : defaults.oscPortamento,
            filterType: controls["filter-type"]
              ? controls["filter-type"].value
              : defaults.filterType,
            filterFreq: controls["filter-freq"]
              ? controls["filter-freq"].value
              : defaults.filterFreq,
            filterQ: controls["filter-q"]
              ? controls["filter-q"].value
              : defaults.filterQ,
            envelopeAttack: controls["envelope-a"]
              ? controls["envelope-a"].value
              : defaults.envelopeAttack,
            envelopeDecay: controls["envelope-d"]
              ? controls["envelope-d"].value
              : defaults.envelopeDecay,
            envelopeSustain: controls["envelope-s"]
              ? controls["envelope-s"].value
              : defaults.envelopeSustain,
            envelopeRelease: controls["envelope-r"]
              ? controls["envelope-r"].value
              : defaults.envelopeRelease,
            lfoType: controls["lfo-type"]
              ? controls["lfo-type"].value
              : defaults.lfoType,
            lfoRate: controls["lfo-rate"]
              ? controls["lfo-rate"].value
              : defaults.lfoRate,
            lfoPitch: controls["lfo-pitch"]
              ? controls["lfo-pitch"].value
              : defaults.lfoPitch,
            lfoFilter: controls["lfo-filter"]
              ? controls["lfo-filter"].value
              : defaults.lfoFilter,
          },
        };
      },
      applyState: function (state) {
        var parameters = parsePersistedState(state);
        if (!parameters) return;

        setControlValue(controls["osc-type"], parameters.oscType);
        setControlValue(controls["osc-detune"], parameters.oscDetune);
        setControlValue(controls["osc-portamento"], parameters.oscPortamento);
        setControlValue(controls["filter-type"], parameters.filterType);
        setControlValue(controls["filter-freq"], parameters.filterFreq);
        setControlValue(controls["filter-q"], parameters.filterQ);
        setControlValue(controls["envelope-a"], parameters.envelopeAttack);
        setControlValue(controls["envelope-d"], parameters.envelopeDecay);
        setControlValue(controls["envelope-s"], parameters.envelopeSustain);
        setControlValue(controls["envelope-r"], parameters.envelopeRelease);
        setControlValue(controls["lfo-type"], parameters.lfoType);
        setControlValue(controls["lfo-rate"], parameters.lfoRate);
        setControlValue(controls["lfo-pitch"], parameters.lfoPitch);
        setControlValue(controls["lfo-filter"], parameters.lfoFilter);
      },
    };
  };
})();
