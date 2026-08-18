function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const FILTER_CUTOFF_MIN = Math.log2(20);
const FILTER_CUTOFF_MAX = Math.log2(20000);

const AUTOMATION_PARAM_MAP = {
  modWaveform: { type: "enum", steps: 4 },
  modFrequency: { type: "linear", min: 0, max: 10 },
  modOsc1: { type: "linear", min: 0, max: 100 },
  modOsc2: { type: "linear", min: 0, max: 100 },
  modDouble: { type: "switch" },
  modQuadruple: { type: "switch" },
  osc1Waveform: { type: "enum", steps: 4 },
  osc1Octave: { type: "enum", steps: 3 },
  osc1Detune: { type: "linear", min: -1200, max: 1200 },
  osc1Mix: { type: "linear", min: 0, max: 100 },
  osc2Waveform: { type: "enum", steps: 4 },
  osc2Octave: { type: "enum", steps: 3 },
  osc2Detune: { type: "linear", min: -1200, max: 1200 },
  osc2Mix: { type: "linear", min: 0, max: 100 },
  filterCutoff: {
    type: "linear",
    min: FILTER_CUTOFF_MIN,
    max: FILTER_CUTOFF_MAX,
  },
  filterQ: { type: "linear", min: 0, max: 20 },
  filterMod: { type: "linear", min: 0, max: 100 },
  filterEnv: { type: "linear", min: 0, max: 100 },
  filterEnvA: { type: "linear", min: 0, max: 100 },
  filterEnvD: { type: "linear", min: 0, max: 100 },
  filterEnvS: { type: "linear", min: 0, max: 100 },
  filterEnvR: { type: "linear", min: 0, max: 100 },
  envA: { type: "linear", min: 0, max: 100 },
  envD: { type: "linear", min: 0, max: 100 },
  envS: { type: "linear", min: 0, max: 100 },
  envR: { type: "linear", min: 0, max: 100 },
  drive: { type: "linear", min: 0, max: 100 },
  reverb: { type: "linear", min: 0, max: 100 },
  volume: { type: "linear", min: 0, max: 100 },
  // octave: { type: "enum", steps: 7 },
};

function toNormalized(spec, internal) {
  if (spec.type === "switch") {
    return internal ? 1 : 0;
  }
  if (spec.type === "enum") {
    return (internal ?? 0) / (spec.steps - 1);
  }
  const range = spec.max - spec.min;
  return ((internal ?? spec.min) - spec.min) / range;
}

function fromNormalized(spec, value) {
  const normalized = clamp01(value);
  if (spec.type === "switch") {
    return normalized >= 0.5;
  }
  if (spec.type === "enum") {
    return Math.round(normalized * (spec.steps - 1));
  }
  return spec.min + normalized * (spec.max - spec.min);
}

const automationInput = {
  getParameterSpecs() {
    return [
      { id: "modWaveform", steps: 4 },
      { id: "modFrequency" },
      { id: "modOsc1" },
      { id: "modOsc2" },
      { id: "modDouble", steps: 2 },
      { id: "modQuadruple", steps: 2 },
      { id: "osc1Waveform", steps: 4 },
      { id: "osc1Octave", steps: 3 },
      { id: "osc1Detune" },
      { id: "osc1Mix" },
      { id: "osc2Waveform", steps: 4 },
      { id: "osc2Octave", steps: 3 },
      { id: "osc2Detune" },
      { id: "osc2Mix" },
      { id: "filterCutoff" },
      { id: "filterQ" },
      { id: "filterMod" },
      { id: "filterEnv" },
      { id: "filterEnvA" },
      { id: "filterEnvD" },
      { id: "filterEnvS" },
      { id: "filterEnvR" },
      { id: "envA" },
      { id: "envD" },
      { id: "envS" },
      { id: "envR" },
      { id: "drive" },
      { id: "reverb" },
      { id: "volume" },
      // { id: "octave", steps: 7 },
    ];
  },
  getParameter(id) {
    const spec = AUTOMATION_PARAM_MAP[id];
    if (!spec) {
      return;
    }
    return toNormalized(spec, getParameter(id));
  },
  setParameter(id, value) {
    const spec = AUTOMATION_PARAM_MAP[id];
    if (!spec) {
      return;
    }
    setParameter(id, fromNormalized(spec, value));
  },
};
