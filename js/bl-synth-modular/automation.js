function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const AUTOMATION_PARAM_MAP = {
  oscType: {
    type: "enum",
    values: ["sawtooth", "square", "sine", "triangle"],
  },
  osc2Type: {
    type: "enum",
    values: ["sawtooth", "square", "sine", "triangle"],
  },
  octave: { type: "linear", min: -2, max: 2, integer: true },
  osc2Octave: { type: "linear", min: -2, max: 2, integer: true },
  osc2Detune: { type: "linear", min: 0, max: 50 },
  osc2Mix: { type: "linear", min: 0, max: 1 },
  noiseLevel: { type: "linear", min: 0, max: 1 },
  filterType: {
    type: "enum",
    values: ["lowpass", "highpass", "bandpass", "notch"],
  },
  filterCutoff: { type: "linear", min: 20, max: 20000 },
  filterResonance: { type: "linear", min: 0, max: 20 },
  filterEnvAmount: { type: "linear", min: 0, max: 1 },
  attack: { type: "linear", min: 0.001, max: 5 },
  decay: { type: "linear", min: 0.001, max: 5 },
  sustain: { type: "linear", min: 0, max: 1 },
  release: { type: "linear", min: 0.01, max: 10 },
  lfoShape: {
    type: "enum",
    values: ["sine", "square", "sawtooth", "triangle"],
  },
  lfoTarget: { type: "enum", values: ["filter", "pitch", "amplitude"] },
  lfoRate: { type: "linear", min: 0.01, max: 30 },
  lfoDepth: { type: "linear", min: 0, max: 1 },
  delayTime: { type: "linear", min: 0.01, max: 1.5 },
  delayFeedback: { type: "linear", min: 0, max: 0.9 },
  delayMix: { type: "linear", min: 0, max: 1 },
  reverbDecay: { type: "linear", min: 0.1, max: 8 },
  reverbMix: { type: "linear", min: 0, max: 1 },
  distortionAmount: { type: "linear", min: 0, max: 1 },
  chorusRate: { type: "linear", min: 0.1, max: 10 },
  chorusDepth: { type: "linear", min: 0, max: 0.01 },
  chorusMix: { type: "linear", min: 0, max: 1 },
  masterVolume: { type: "linear", min: 0, max: 1 },
};

function toNormalized(spec, internal) {
  if (spec.type === "enum") {
    const index = spec.values.indexOf(internal);
    return (index < 0 ? 0 : index) / (spec.values.length - 1);
  }
  return ((internal ?? spec.min) - spec.min) / (spec.max - spec.min);
}

function fromNormalized(spec, value) {
  const normalized = clamp01(value);
  if (spec.type === "enum") {
    return spec.values[Math.round(normalized * (spec.values.length - 1))];
  }
  const next = spec.min + normalized * (spec.max - spec.min);
  return spec.integer ? Math.round(next) : next;
}

const automationInput = {
  getParameterSpecs() {
    return [
      { id: "oscType", steps: 4 },
      { id: "octave", steps: 5 },
      { id: "osc2Type", steps: 4 },
      { id: "osc2Octave", steps: 5 },
      { id: "osc2Detune" },
      { id: "osc2Mix" },
      { id: "noiseLevel" },
      { id: "filterType", steps: 4 },
      { id: "filterCutoff" },
      { id: "filterResonance" },
      { id: "filterEnvAmount" },
      { id: "attack" },
      { id: "decay" },
      { id: "sustain" },
      { id: "release" },
      { id: "lfoShape", steps: 4 },
      { id: "lfoTarget", steps: 3 },
      { id: "lfoRate" },
      { id: "lfoDepth" },
      { id: "delayTime" },
      { id: "delayFeedback" },
      { id: "delayMix" },
      { id: "reverbDecay" },
      { id: "reverbMix" },
      { id: "distortionAmount" },
      { id: "chorusRate" },
      { id: "chorusDepth" },
      { id: "chorusMix" },
      { id: "masterVolume" },
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
