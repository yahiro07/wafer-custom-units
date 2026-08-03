(function () {
  "use strict";

  var LFO_TYPES = ["sine", "square", "sawtooth", "triangle"];

  var SPECIAL_CONTROLS = {
    effectMix: {
      selector: "#effectMix input[type=range]",
      type: "range",
      defaultValue: 1.0,
    },
    monoInput: {
      selector: "#effectMix input[type=checkbox]",
      type: "checkbox",
      defaultValue: true,
    },
    distDrive: {
      selector: "#distortionControls input[type=range]",
      type: "range",
      defaultValue: 5,
    },
    awDepth: {
      selector: "#autowahControls input[min='0'][max='4']",
      type: "range",
      defaultValue: 3.5,
    },
  };

  var RANGE_CONTROLS = {
    dtime: 0.15,
    dregen: 0.75,
    lfo: 3,
    lfodepth: 1.0,
    cspeed: 3.5,
    cdelay: 0.03,
    cdepth: 0.002,
    flspeed: 0.25,
    fldelay: 0.005,
    fldepth: 0.002,
    flfb: 0.5,
    rmfreq: 11,
    scspeed: 3.5,
    scdelay: 0.03,
    scdepth: 0.002,
    sflspeed: 0.15,
    sfldelay: 0.003,
    sfldepth: 0.005,
    sflfb: 0.9,
    octpitch: -1,
    mdtime: 0.15,
    mdfeedback: 0.5,
    mdspeed: 3.5,
    mddelay: 0.03,
    mddepth: 0.002,
    lplfo: 3,
    lplfodepth: 1.0,
    lplfoq: 3.0,
    awEF: 10,
    awQ: 5.0,
    ngEF: 10,
    ngFloor: 0.01,
    vspeed: 3.5,
    vdelay: 0.03,
    vdepth: 0.002,
    bitdepth: 8,
    btcrFreq: 1,
    apolloFloor: 0.01,
  };

  var SELECT_CONTROLS = {
    lfotype: "sine",
    lplfotype: "sine",
  };

  function getDefaultParameters() {
    var defaults = {
      effect: 0,
      effectMix: SPECIAL_CONTROLS.effectMix.defaultValue,
      monoInput: SPECIAL_CONTROLS.monoInput.defaultValue,
      distDrive: SPECIAL_CONTROLS.distDrive.defaultValue,
      awDepth: SPECIAL_CONTROLS.awDepth.defaultValue,
    };

    Object.keys(RANGE_CONTROLS).forEach(function (key) {
      defaults[key] = RANGE_CONTROLS[key];
    });
    Object.keys(SELECT_CONTROLS).forEach(function (key) {
      defaults[key] = SELECT_CONTROLS[key];
    });
    return defaults;
  }

  function serializableNumber(value, fallback) {
    var number = typeof value === "number" ? value : parseFloat(value);
    return isNaN(number) ? fallback : number;
  }

  function serializableOption(value, options, fallback) {
    return options.indexOf(value) >= 0 ? value : fallback;
  }

  function getSpecialControl(key) {
    var config = SPECIAL_CONTROLS[key];
    if (!config) return null;
    return document.querySelector(config.selector);
  }

  function readControlValue(key, defaults) {
    if (SPECIAL_CONTROLS[key]) {
      var special = getSpecialControl(key);
      if (!special) return defaults[key];
      if (SPECIAL_CONTROLS[key].type === "checkbox") {
        return special.checked;
      }
      return serializableNumber(special.value, defaults[key]);
    }

    if (SELECT_CONTROLS[key] !== undefined) {
      var select = document.getElementById(key);
      return select
        ? serializableOption(select.value, LFO_TYPES, defaults[key])
        : defaults[key];
    }

    if (RANGE_CONTROLS[key] !== undefined) {
      var range = document.getElementById(key);
      return range
        ? serializableNumber(range.value, defaults[key])
        : defaults[key];
    }

    return defaults[key];
  }

  function writeControlValue(key, value) {
    if (SPECIAL_CONTROLS[key]) {
      var special = getSpecialControl(key);
      if (!special || value === undefined) return;
      if (SPECIAL_CONTROLS[key].type === "checkbox") {
        special.checked = !!value;
      } else {
        special.value = value;
      }
      return;
    }

    var element = document.getElementById(key);
    if (!element || value === undefined) return;
    element.value = value;
  }

  function parsePersistedState(state) {
    if (!state || typeof state !== "object") return null;

    var parameters = state.parameters;
    if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
      if (typeof state.effect === "number") {
        parameters = state;
      } else {
        return null;
      }
    }

    var defaults = getDefaultParameters();
    var parsed = {
      effect: serializableNumber(parameters.effect, defaults.effect),
      effectMix: serializableNumber(parameters.effectMix, defaults.effectMix),
      monoInput:
        parameters.monoInput === undefined
          ? defaults.monoInput
          : !!parameters.monoInput,
      distDrive: serializableNumber(parameters.distDrive, defaults.distDrive),
      awDepth: serializableNumber(parameters.awDepth, defaults.awDepth),
    };

    Object.keys(RANGE_CONTROLS).forEach(function (key) {
      parsed[key] = serializableNumber(parameters[key], defaults[key]);
    });
    Object.keys(SELECT_CONTROLS).forEach(function (key) {
      parsed[key] = serializableOption(parameters[key], LFO_TYPES, defaults[key]);
    });

    parsed.effect = Math.max(0, Math.min(21, Math.round(parsed.effect)));
    return parsed;
  }

  function syncActiveEffectFromControls(effectIndex) {
    switch (effectIndex) {
      case 2:
        if (waveshaper) {
          var drive = getSpecialControl("distDrive");
          if (drive) waveshaper.setDrive(parseFloat(drive.value));
        }
        break;
      case 10:
        if (typeof effect !== "undefined" && effect.setPitchOffset) {
          var pitch = document.getElementById("octpitch");
          if (pitch) effect.setPitchOffset(parseFloat(pitch.value));
        }
        break;
      case 13:
        if (lplfo) {
          var lplfoType = document.getElementById("lplfotype");
          if (lplfoType) lplfo.type = lplfoType.value;
        }
        break;
      case 16:
        if (ngGate) {
          var floor = document.getElementById("ngFloor");
          if (floor) ngGate.curve = generateNoiseFloorCurve(parseFloat(floor.value));
        }
        break;
      case 20: {
        var bits = document.getElementById("bitdepth");
        var freq = document.getElementById("btcrFreq");
        if (bits) btcrBits = parseInt(bits.value, 10);
        if (freq) btcrNormFreq = parseFloat(freq.value);
        setBitCrusherDepth(btcrBits);
        break;
      }
      case 21:
        if (apolloGate) {
          var apolloFloor = document.getElementById("apolloFloor");
          if (apolloFloor) {
            apolloGate.curve = generateNoiseFloorCurve(parseFloat(apolloFloor.value));
          }
        }
        break;
      default:
        break;
    }
  }

  function applyPersistedState(state) {
    var parameters = parsePersistedState(state);
    if (!parameters) return;

    if (!dryGain) {
      pendingPersistedState = state;
      return;
    }

    Object.keys(RANGE_CONTROLS).forEach(function (key) {
      writeControlValue(key, parameters[key]);
    });
    Object.keys(SELECT_CONTROLS).forEach(function (key) {
      writeControlValue(key, parameters[key]);
    });
    writeControlValue("distDrive", parameters.distDrive);
    writeControlValue("awDepth", parameters.awDepth);
    writeControlValue("effectMix", parameters.effectMix);
    writeControlValue("monoInput", parameters.monoInput);

    var effectSelect = document.getElementById("effect");
    if (effectSelect) {
      effectSelect.selectedIndex = parameters.effect;
    }

    changeEffect();
    rebuildInputRouting();
    crossfade(parameters.effectMix);
    syncActiveEffectFromControls(parameters.effect);
  }

  var pendingPersistedState = null;

  function flushPendingPersistedState() {
    if (!pendingPersistedState) return;
    var state = pendingPersistedState;
    pendingPersistedState = null;
    applyPersistedState(state);
  }

  function emitPersistedState() {
    var defaults = getDefaultParameters();
    var parameters = {
      effect: readControlValue("effect", defaults),
      effectMix: readControlValue("effectMix", defaults),
      monoInput: readControlValue("monoInput", defaults),
      distDrive: readControlValue("distDrive", defaults),
      awDepth: readControlValue("awDepth", defaults),
    };

    Object.keys(RANGE_CONTROLS).forEach(function (key) {
      parameters[key] = readControlValue(key, defaults);
    });
    Object.keys(SELECT_CONTROLS).forEach(function (key) {
      parameters[key] = readControlValue(key, defaults);
    });

    var effectSelect = document.getElementById("effect");
    parameters.effect = effectSelect
      ? effectSelect.selectedIndex
      : defaults.effect;

    return { parameters: parameters };
  }

  window.emitPersistedState = emitPersistedState;
  window.applyPersistedState = applyPersistedState;
  window.flushPendingPersistedState = flushPendingPersistedState;
})();
