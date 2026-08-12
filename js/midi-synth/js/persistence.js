function serializableNumber(value, fallback) {
  var number = typeof value === "number" ? value : parseFloat(value);
  return isNaN(number) ? fallback : number;
}

function emitPersistedState() {
  var defaults = getDefaultParameters();
  return {
    parameters: {
      modWaveform: serializableNumber(currentModWaveform, defaults.modWaveform),
      modFrequency: serializableNumber(
        currentModFrequency,
        defaults.modFrequency,
      ),
      modOsc1: serializableNumber(currentModOsc1, defaults.modOsc1),
      modOsc2: serializableNumber(currentModOsc2, defaults.modOsc2),
      modDouble: !!moDouble,
      modQuadruple: !!moQuadruple,
      osc1Waveform: serializableNumber(
        currentOsc1Waveform,
        defaults.osc1Waveform,
      ),
      osc1Octave: serializableNumber(currentOsc1Octave, defaults.osc1Octave),
      osc1Detune: serializableNumber(currentOsc1Detune, defaults.osc1Detune),
      osc1Mix: serializableNumber(currentOsc1Mix, defaults.osc1Mix),
      osc2Waveform: serializableNumber(
        currentOsc2Waveform,
        defaults.osc2Waveform,
      ),
      osc2Octave: serializableNumber(currentOsc2Octave, defaults.osc2Octave),
      osc2Detune: serializableNumber(currentOsc2Detune, defaults.osc2Detune),
      osc2Mix: serializableNumber(currentOsc2Mix, defaults.osc2Mix),
      filterCutoff: serializableNumber(
        currentFilterCutoff,
        defaults.filterCutoff,
      ),
      filterQ: serializableNumber(currentFilterQ, defaults.filterQ),
      filterMod: serializableNumber(currentFilterMod, defaults.filterMod),
      filterEnv: serializableNumber(currentFilterEnv, defaults.filterEnv),
      envA: serializableNumber(currentEnvA, defaults.envA),
      envD: serializableNumber(currentEnvD, defaults.envD),
      envS: serializableNumber(currentEnvS, defaults.envS),
      envR: serializableNumber(currentEnvR, defaults.envR),
      filterEnvA: serializableNumber(currentFilterEnvA, defaults.filterEnvA),
      filterEnvD: serializableNumber(currentFilterEnvD, defaults.filterEnvD),
      filterEnvS: serializableNumber(currentFilterEnvS, defaults.filterEnvS),
      filterEnvR: serializableNumber(currentFilterEnvR, defaults.filterEnvR),
      drive: serializableNumber(currentDrive, defaults.drive),
      reverb: serializableNumber(currentRev, defaults.reverb),
      volume: serializableNumber(currentVol, defaults.volume),
      octave: serializableNumber(currentOctave, defaults.octave),
    },
  };
}

function parsePersistedState(state) {
  if (!state || typeof state !== "object") return null;

  var parameters = state.parameters;
  if (!parameters || typeof parameters !== "object") {
    if (typeof state.modWaveform === "number") {
      parameters = state;
    } else {
      return null;
    }
  }

  return Object.assign(getDefaultParameters(), parameters);
}

function setKnobValue(id, value, fire) {
  var el = $(id);
  if (!el) return false;

  if (typeof el.setValue === "function") {
    el.setValue(value, fire);
    return true;
  }

  el.setAttribute("value", String(value));
  return false;
}

function areKnobsReady() {
  var knob = $("mFreq");
  return knob && typeof knob.setValue === "function";
}

var syncSynthUIAttempts = 0;

function syncSynthUI() {
  if (!$("modwave")) return;

  $("modwave").selectedIndex = currentModWaveform;
  setKnobValue("mFreq", currentModFrequency, false);
  setKnobValue("modOsc1", currentModOsc1, false);
  setKnobValue("modOsc2", currentModOsc2, false);
  $("osc1wave").selectedIndex = currentOsc1Waveform;
  $("osc1int").selectedIndex = currentOsc1Octave;
  setKnobValue("osc1detune", currentOsc1Detune, false);
  setKnobValue("osc1mix", currentOsc1Mix, false);
  $("osc2wave").selectedIndex = currentOsc2Waveform;
  $("osc2int").selectedIndex = currentOsc2Octave;
  setKnobValue("osc2detune", currentOsc2Detune, false);
  setKnobValue("osc2mix", currentOsc2Mix, false);
  setKnobValue("fFreq", Math.pow(2, currentFilterCutoff), false);
  setKnobValue("fQ", currentFilterQ, false);
  setKnobValue("fMod", currentFilterMod, false);
  setKnobValue("fEnv", currentFilterEnv, false);
  setKnobValue("fA", currentFilterEnvA, false);
  setKnobValue("fD", currentFilterEnvD, false);
  setKnobValue("fS", currentFilterEnvS, false);
  setKnobValue("fR", currentFilterEnvR, false);
  setKnobValue("vA", currentEnvA, false);
  setKnobValue("vD", currentEnvD, false);
  setKnobValue("vS", currentEnvS, false);
  setKnobValue("vR", currentEnvR, false);
  setKnobValue("drive", currentDrive, false);
  setKnobValue("reverb", currentRev, false);
  setKnobValue("volume", currentVol, false);
  $("kbd_oct").selectedIndex = currentOctave;

  if (!areKnobsReady() && syncSynthUIAttempts < 120) {
    syncSynthUIAttempts++;
    requestAnimationFrame(syncSynthUI);
    return;
  }

  syncSynthUIAttempts = 0;
}

function applyPersistedState(state) {
  var parameters = parsePersistedState(state);
  if (!parameters) return;

  currentModWaveform = parameters.modWaveform;
  currentModFrequency = parameters.modFrequency;
  currentModOsc1 = parameters.modOsc1;
  currentModOsc2 = parameters.modOsc2;
  moDouble = parameters.modDouble;
  moQuadruple = parameters.modQuadruple;

  currentOsc1Waveform = parameters.osc1Waveform;
  currentOsc1Octave = parameters.osc1Octave;
  currentOsc1Detune = parameters.osc1Detune;
  currentOsc1Mix = parameters.osc1Mix;
  currentOsc2Waveform = parameters.osc2Waveform;
  currentOsc2Octave = parameters.osc2Octave;
  currentOsc2Detune = parameters.osc2Detune;
  currentOsc2Mix = parameters.osc2Mix;

  currentFilterCutoff = parameters.filterCutoff;
  currentFilterQ = parameters.filterQ;
  currentFilterMod = parameters.filterMod;
  currentFilterEnv = parameters.filterEnv;

  currentEnvA = parameters.envA;
  currentEnvD = parameters.envD;
  currentEnvS = parameters.envS;
  currentEnvR = parameters.envR;
  currentFilterEnvA = parameters.filterEnvA;
  currentFilterEnvD = parameters.filterEnvD;
  currentFilterEnvS = parameters.filterEnvS;
  currentFilterEnvR = parameters.filterEnvR;

  currentDrive = parameters.drive;
  currentRev = parameters.reverb;
  currentVol = parameters.volume;
  currentOctave = parameters.octave;

  onUpdateModWaveform({ target: { selectedIndex: currentModWaveform } });
  onUpdateModFrequency(currentModFrequency);
  onUpdateModOsc1(currentModOsc1);
  onUpdateModOsc2(currentModOsc2);
  changeModMultiplier();

  onUpdateOsc1Wave({ target: { selectedIndex: currentOsc1Waveform } });
  onUpdateOsc1Octave({ target: { selectedIndex: currentOsc1Octave } });
  onUpdateOsc1Detune({ target: { value: currentOsc1Detune } });
  onUpdateOsc1Mix(currentOsc1Mix);

  onUpdateOsc2Wave({ target: { selectedIndex: currentOsc2Waveform } });
  onUpdateOsc2Octave({ target: { selectedIndex: currentOsc2Octave } });
  onUpdateOsc2Detune({ target: { value: currentOsc2Detune } });
  onUpdateOsc2Mix({ target: { value: currentOsc2Mix } });

  onUpdateFilterCutoff(currentFilterCutoff);
  onUpdateFilterQ(currentFilterQ);
  onUpdateFilterMod(currentFilterMod);
  onUpdateFilterEnv({ target: { value: currentFilterEnv } });

  onUpdateEnvA({ target: { value: currentEnvA } });
  onUpdateEnvD({ target: { value: currentEnvD } });
  onUpdateEnvS({ target: { value: currentEnvS } });
  onUpdateEnvR({ target: { value: currentEnvR } });
  onUpdateFilterEnvA({ target: { value: currentFilterEnvA } });
  onUpdateFilterEnvD({ target: { value: currentFilterEnvD } });
  onUpdateFilterEnvS({ target: { value: currentFilterEnvS } });
  onUpdateFilterEnvR({ target: { value: currentFilterEnvR } });

  if (waveshaper && volNode) {
    onUpdateDrive(currentDrive);
    onUpdateReverb({ target: { value: currentRev } });
    onUpdateVolume({ target: { value: currentVol } });
  }

  syncSynthUI();
}
