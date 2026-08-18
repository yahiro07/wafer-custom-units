import { selectOptions } from "@/util/constants";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const waveformValues = selectOptions.waveform.map((option) => option.value);
const filterValues = selectOptions.filter.map((option) => option.value);
const reverbValues = selectOptions.reverb.map((option) => option.value);

export const AUTOMATION_PARAM_MAP = {
  masterVolume: { type: "linear", min: 0, max: 1 },
  gainAttack: { type: "linear", min: 0, max: 2 },
  gainDecay: { type: "linear", min: 0, max: 2 },
  gainSustain: { type: "linear", min: 0, max: 0.7 },
  gainRelease: { type: "linear", min: 0, max: 2 },
  vcoType: { type: "enum", values: waveformValues },
  vcoGain: { type: "linear", min: 0, max: 1 },
  vcoPan: { type: "linear", min: -1, max: 1 },
  sub1Type: { type: "enum", values: waveformValues },
  sub1Offset: { type: "linear", min: -24, max: 24, integer: true },
  sub1Pan: { type: "linear", min: -1, max: 1 },
  sub1Gain: { type: "linear", min: 0, max: 1 },
  sub2Type: { type: "enum", values: waveformValues },
  sub2Offset: { type: "linear", min: -24, max: 24, integer: true },
  sub2Pan: { type: "linear", min: -1, max: 1 },
  sub2Gain: { type: "linear", min: 0, max: 1 },
  delayTime: { type: "linear", min: 0, max: 1 },
  delayFeedback: { type: "linear", min: 0, max: 1 },
  delayTone: { type: "linear", min: 0, max: 11000 },
  delayAmount: { type: "linear", min: 0, max: 1 },
  filterType: { type: "enum", values: filterValues },
  filterFreq: { type: "linear", min: 0, max: 11000 },
  filterQ: { type: "linear", min: 0, max: 10 },
  filterAttack: { type: "linear", min: 0, max: 2 },
  filterDecay: { type: "linear", min: 0, max: 2 },
  filterEnvAmount: { type: "linear", min: -12000, max: 12000 },
  reverbType: { type: "enum", values: reverbValues },
  reverbAmount: { type: "linear", min: 0, max: 1 },
  portamentoSpeed: { type: "linear", min: 0, max: 0.5 },
  distortionDist: { type: "linear", min: 0, max: 30 },
  distortionAmount: { type: "linear", min: 0, max: 1 },
  vibratoDepth: { type: "linear", min: 0, max: 400 },
  vibratoRate: { type: "linear", min: 0, max: 50 },
  bitCrushDepth: { type: "linear", min: 2, max: 16, integer: true },
  bitCrushAmount: { type: "linear", min: 0, max: 1 },
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

export function createAutomationInput(synth) {
  return {
    getParameterSpecs() {
      return Object.entries(AUTOMATION_PARAM_MAP).map(([id, spec]) =>
        spec.type === "enum" ? { id, steps: spec.values.length } : { id },
      );
    },
    getParameter(id) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      return toNormalized(spec, synth.getParameter(id));
    },
    setParameter(id, value) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      synth.setParameter(id, fromNormalized(spec, value));
    },
  };
}
