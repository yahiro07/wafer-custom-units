import { WAVEFORM, FILTER, REVERB } from "src/util/util";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const waveformValues = Object.keys(WAVEFORM);
const filterValues = Object.keys(FILTER);
const reverbValues = Object.keys(REVERB);

export const AUTOMATION_PARAM_MAP = {
  polyphony: { type: "linear", min: 1, max: 8, integer: true, steps: 8 },
  portamentoSpeed: { type: "linear", min: 0, max: 0.5 },
  masterVolume: { type: "linear", min: 0, max: 1 },
  masterFilterType: { type: "enum", values: filterValues },
  masterFilterFreq: { type: "linear", min: 0, max: 11000 },
  masterFilterQ: { type: "linear", min: 0, max: 20 },
  masterFilterGain: { type: "linear", min: -40, max: 40 },
  vcoType: { type: "enum", values: waveformValues },
  gainAttack: { type: "linear", min: 0, max: 3 },
  gainDecay: { type: "linear", min: 0, max: 3 },
  gainSustain: { type: "linear", min: 0, max: 0.7 },
  gainRelease: { type: "linear", min: 0, max: 3 },
  filterType: { type: "enum", values: filterValues },
  filterFreq: { type: "linear", min: 0, max: 11000 },
  filterQ: { type: "linear", min: 0, max: 20 },
  filterGain: { type: "linear", min: -40, max: 40 },
  filterAttack: { type: "linear", min: 0, max: 3 },
  filterDecay: { type: "linear", min: 0, max: 3 },
  filterRelease: { type: "linear", min: 0, max: 3 },
  filterEnvAmount: { type: "linear", min: -11000, max: 11000 },
  distortionAmount: { type: "linear", min: 0, max: 1 },
  distortionDist: { type: "linear", min: 0, max: 30 },
  reverbType: { type: "enum", values: reverbValues },
  reverbAmount: { type: "linear", min: 0, max: 1 },
  flangerAmount: { type: "linear", min: 0, max: 1 },
  flangerDepth: { type: "linear", min: 0, max: 0.005 },
  flangerRate: { type: "linear", min: 0, max: 2 },
  flangerFeedback: { type: "linear", min: 0, max: 1 },
  flangerDelay: { type: "linear", min: 0.005, max: 0.02 },
  delayTime: { type: "linear", min: 0, max: 1 },
  delayFeedback: { type: "linear", min: 0, max: 1 },
  delayTone: { type: "linear", min: 0, max: 11000 },
  delayAmount: { type: "linear", min: 0, max: 1 },
  pingPongDelayTime: { type: "linear", min: 0, max: 1 },
  pingPongFeedback: { type: "linear", min: 0, max: 1 },
  pingPongTone: { type: "linear", min: 0, max: 11000 },
  pingPongAmount: { type: "linear", min: 0, max: 1 },
  vibratoDepth: { type: "linear", min: 0, max: 200 },
  vibratoRate: { type: "linear", min: 0, max: 50 },
  bitCrushDepth: { type: "linear", min: 2, max: 16, integer: true },
  bitCrushAmount: { type: "linear", min: 0, max: 1 },
  eqLowGain: { type: "linear", min: -24, max: 24 },
  eqHighGain: { type: "linear", min: -24, max: 24 },
  eqLowFreq: { type: "linear", min: 0, max: 640 },
  eqHighFreq: { type: "linear", min: 2400, max: 11000 },
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

export function createAutomationInput(getController) {
  return {
    getParameterSpecs() {
      return Object.entries(AUTOMATION_PARAM_MAP).map(([id, spec]) => {
        if (spec.type === "enum") {
          return { id, steps: spec.values.length };
        }
        if (spec.steps) {
          return { id, steps: spec.steps };
        }
        return { id };
      });
    },
    getParameter(id) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      return toNormalized(spec, getController().getParameter(id));
    },
    setParameter(id, value) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      getController().setParameter(id, fromNormalized(spec, value));
    },
  };
}
