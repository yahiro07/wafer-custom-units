import { useSynthStore } from "../synthStore";
import { routingToValue, valueToRouting } from "@/components/Modifiers/utils";
import type { OscillatorType } from "../types/synth";
import type { FilterType, RangeType } from "@/synth/types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

const OSC_WAVEFORMS = [
  "triangle",
  "sawtooth",
  "square",
  "sine",
] as const satisfies readonly OscillatorType[];

const OSC_RANGES = ["32", "16", "8", "4", "2"] as const satisfies readonly RangeType[];

const FILTER_TYPES = [
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
] as const satisfies readonly FilterType[];

const NOISE_TYPES = ["white", "pink"] as const;

type LinearSpec = {
  type: "linear";
  min: number;
  max: number;
  integer?: boolean;
  steps?: number;
  log?: boolean;
};
type EnumSpec = { type: "enum"; values: readonly string[] };
type SwitchSpec = { type: "switch" };
type AutomationSpec = LinearSpec | EnumSpec | SwitchSpec;

function oscSpecs(prefix: string): Record<string, AutomationSpec> {
  return {
    [`${prefix}Waveform`]: { type: "enum", values: OSC_WAVEFORMS },
    [`${prefix}Frequency`]: { type: "linear", min: -12, max: 12 },
    [`${prefix}Range`]: { type: "enum", values: OSC_RANGES },
    [`${prefix}Detune`]: { type: "linear", min: -50, max: 50 },
    [`${prefix}Volume`]: { type: "linear", min: 0, max: 1 },
    [`${prefix}Pan`]: { type: "linear", min: -1, max: 1 },
  };
}

export const AUTOMATION_PARAM_MAP: Record<string, AutomationSpec> = {
  octave: { type: "linear", min: -2, max: 2, integer: true, steps: 5 },
  glide: { type: "linear", min: 0, max: 10 },
  modMix: { type: "linear", min: 0, max: 100 },
  modWheel: { type: "linear", min: 0, max: 100 },
  ...oscSpecs("osc1"),
  ...oscSpecs("osc2"),
  ...oscSpecs("osc3"),
  noiseVolume: { type: "linear", min: 0, max: 1 },
  noisePan: { type: "linear", min: -1, max: 1 },
  noiseType: { type: "enum", values: NOISE_TYPES },
  noiseTone: { type: "linear", min: 440, max: 20000, log: true },
  noiseSync: { type: "switch" },
  filterType: { type: "enum", values: FILTER_TYPES },
  filterCutoff: { type: "linear", min: 20, max: 20000 },
  filterResonance: { type: "linear", min: 0, max: 1 },
  filterContour: { type: "linear", min: 0, max: 1 },
  envAttack: { type: "linear", min: 0, max: 2 },
  envDecay: { type: "linear", min: 0, max: 2 },
  envSustain: { type: "linear", min: 0, max: 1 },
  envRelease: { type: "linear", min: 0, max: 4 },
  lfoRate: { type: "linear", min: 0.1, max: 20 },
  lfoDepth: { type: "linear", min: 0, max: 1 },
  lfoWaveform: { type: "enum", values: OSC_WAVEFORMS },
  lfoRouting: { type: "linear", min: 0, max: 15, integer: true, steps: 16 },
  reverbAmount: { type: "linear", min: 0, max: 100 },
  reverbDecay: { type: "linear", min: 0.1, max: 5 },
  reverbEq: { type: "linear", min: 0, max: 100 },
  distortionOutputGain: { type: "linear", min: 0, max: 100 },
  distortionLowEQ: { type: "linear", min: 0, max: 100 },
  distortionHighEQ: { type: "linear", min: 0, max: 100 },
  delayAmount: { type: "linear", min: 0, max: 100 },
  delayTime: { type: "linear", min: 0.1, max: 2 },
  delayFeedback: { type: "linear", min: 0, max: 100 },
};

function toNormalized(spec: AutomationSpec, internal: unknown): number {
  if (spec.type === "switch") {
    return internal ? 1 : 0;
  }
  if (spec.type === "enum") {
    const index = spec.values.indexOf(internal as string);
    return (index < 0 ? 0 : index) / (spec.values.length - 1);
  }
  const value = Number(internal ?? spec.min);
  if (spec.log) {
    const logMin = Math.log2(spec.min);
    const logMax = Math.log2(spec.max);
    return (Math.log2(Math.max(spec.min, value)) - logMin) / (logMax - logMin);
  }
  return (value - spec.min) / (spec.max - spec.min);
}

function fromNormalized(spec: AutomationSpec, value: number): unknown {
  const normalized = clamp01(value);
  if (spec.type === "switch") {
    return normalized >= 0.5;
  }
  if (spec.type === "enum") {
    return spec.values[Math.round(normalized * (spec.values.length - 1))];
  }
  if (spec.log) {
    const logMin = Math.log2(spec.min);
    const logMax = Math.log2(spec.max);
    return 2 ** (logMin + normalized * (logMax - logMin));
  }
  const next = spec.min + normalized * (spec.max - spec.min);
  return spec.integer ? Math.round(next) : next;
}

const OSC_FIELD = /^(osc[123])(Waveform|Frequency|Range|Detune|Volume|Pan)$/;

export function getParameter(id: string): unknown {
  if (!(id in AUTOMATION_PARAM_MAP)) {
    return;
  }
  const state = useSynthStore.getState();
  const oscMatch = id.match(OSC_FIELD);
  if (oscMatch) {
    const oscId = Number(oscMatch[1].slice(3)) as 1 | 2 | 3;
    const field = oscMatch[2];
    const osc = state.oscillators[`osc${oscId}`];
    if (field === "Volume") {
      return state.mixer[`osc${oscId}Volume`];
    }
    if (field === "Frequency") {
      return osc.frequency;
    }
    if (field === "Waveform") {
      return osc.waveform;
    }
    if (field === "Range") {
      return osc.range;
    }
    if (field === "Detune") {
      return osc.detune;
    }
    return osc.pan ?? 0;
  }

  switch (id) {
    case "octave":
      return state.octave;
    case "glide":
      return state.glide;
    case "modMix":
      return state.mixer.modMix;
    case "modWheel":
      return state.modWheel;
    case "noiseVolume":
      return state.noise.volume;
    case "noisePan":
      return state.noise.pan;
    case "noiseType":
      return state.noise.type;
    case "noiseTone":
      return state.noise.tone;
    case "noiseSync":
      return state.noise.sync;
    case "filterType":
      return state.modifiers.filterType;
    case "filterCutoff":
      return state.modifiers.cutoff;
    case "filterResonance":
      return state.modifiers.resonance;
    case "filterContour":
      return state.modifiers.contourAmount;
    case "envAttack":
      return state.modifiers.envelope.attack;
    case "envDecay":
      return state.modifiers.envelope.decay;
    case "envSustain":
      return state.modifiers.envelope.sustain;
    case "envRelease":
      return state.modifiers.envelope.release;
    case "lfoRate":
      return state.modifiers.lfo.rate;
    case "lfoDepth":
      return state.modifiers.lfo.depth;
    case "lfoWaveform":
      return state.modifiers.lfo.waveform;
    case "lfoRouting":
      return routingToValue(state.modifiers.lfo.routing);
    case "reverbAmount":
      return state.effects.reverb.amount;
    case "reverbDecay":
      return state.effects.reverb.decay;
    case "reverbEq":
      return state.effects.reverb.eq;
    case "distortionOutputGain":
      return state.effects.distortion.outputGain;
    case "distortionLowEQ":
      return state.effects.distortion.lowEQ;
    case "distortionHighEQ":
      return state.effects.distortion.highEQ;
    case "delayAmount":
      return state.effects.delay.amount;
    case "delayTime":
      return state.effects.delay.time;
    case "delayFeedback":
      return state.effects.delay.feedback;
    default:
      return;
  }
}

export function setParameter(id: string, value: unknown): void {
  if (!(id in AUTOMATION_PARAM_MAP)) {
    return;
  }
  const store = useSynthStore.getState();
  const oscMatch = id.match(OSC_FIELD);
  if (oscMatch) {
    const oscId = Number(oscMatch[1].slice(3)) as 1 | 2 | 3;
    const field = oscMatch[2];
    if (field === "Volume") {
      const volume = value as number;
      if (oscId === 1) {
        store.updateMixer({ osc1Volume: volume });
      } else if (oscId === 2) {
        store.updateMixer({ osc2Volume: volume });
      } else {
        store.updateMixer({ osc3Volume: volume });
      }
      return;
    }
    const key =
      field === "Frequency"
        ? "frequency"
        : field === "Waveform"
          ? "waveform"
          : field === "Range"
            ? "range"
            : field === "Detune"
              ? "detune"
              : "pan";
    store.updateOscillator(oscId, { [key]: value });
    return;
  }

  switch (id) {
    case "octave":
      store.setOctave(value as number);
      return;
    case "glide":
      store.setGlide(value as number);
      return;
    case "modMix":
      store.updateMixer({ modMix: value as number });
      return;
    case "modWheel":
      store.setModWheel(value as number);
      return;
    case "noiseVolume":
      store.updateNoise({ volume: value as number });
      return;
    case "noisePan":
      store.updateNoise({ pan: value as number });
      return;
    case "noiseType":
      store.updateNoise({ type: value as "white" | "pink" });
      return;
    case "noiseTone":
      store.updateNoise({ tone: value as number });
      return;
    case "noiseSync":
      store.updateNoise({ sync: Boolean(value) });
      return;
    case "filterType":
      store.updateModifiers({ filterType: value as FilterType });
      return;
    case "filterCutoff":
      store.updateModifiers({ cutoff: value as number });
      return;
    case "filterResonance":
      store.updateModifiers({ resonance: value as number });
      return;
    case "filterContour":
      store.updateModifiers({ contourAmount: value as number });
      return;
    case "envAttack":
      store.updateModifiers({
        envelope: { ...store.modifiers.envelope, attack: value as number },
      });
      return;
    case "envDecay":
      store.updateModifiers({
        envelope: { ...store.modifiers.envelope, decay: value as number },
      });
      return;
    case "envSustain":
      store.updateModifiers({
        envelope: { ...store.modifiers.envelope, sustain: value as number },
      });
      return;
    case "envRelease":
      store.updateModifiers({
        envelope: { ...store.modifiers.envelope, release: value as number },
      });
      return;
    case "lfoRate":
      store.updateModifiers({
        lfo: { ...store.modifiers.lfo, rate: value as number },
      });
      return;
    case "lfoDepth":
      store.updateModifiers({
        lfo: { ...store.modifiers.lfo, depth: value as number },
      });
      return;
    case "lfoWaveform":
      store.updateModifiers({
        lfo: {
          ...store.modifiers.lfo,
          waveform: value as OscillatorType,
        },
      });
      return;
    case "lfoRouting":
      store.updateModifiers({
        lfo: {
          ...store.modifiers.lfo,
          routing: valueToRouting(value as number),
        },
      });
      return;
    case "reverbAmount":
      store.updateEffects({
        reverb: { ...store.effects.reverb, amount: value as number },
      });
      return;
    case "reverbDecay":
      store.updateEffects({
        reverb: { ...store.effects.reverb, decay: value as number },
      });
      return;
    case "reverbEq":
      store.updateEffects({
        reverb: { ...store.effects.reverb, eq: value as number },
      });
      return;
    case "distortionOutputGain":
      store.updateEffects({
        distortion: {
          ...store.effects.distortion,
          outputGain: value as number,
        },
      });
      return;
    case "distortionLowEQ":
      store.updateEffects({
        distortion: { ...store.effects.distortion, lowEQ: value as number },
      });
      return;
    case "distortionHighEQ":
      store.updateEffects({
        distortion: { ...store.effects.distortion, highEQ: value as number },
      });
      return;
    case "delayAmount":
      store.updateEffects({
        delay: { ...store.effects.delay, amount: value as number },
      });
      return;
    case "delayTime":
      store.updateEffects({
        delay: { ...store.effects.delay, time: value as number },
      });
      return;
    case "delayFeedback":
      store.updateEffects({
        delay: { ...store.effects.delay, feedback: value as number },
      });
      return;
  }
}

export function createAutomationInput() {
  return {
    getParameterSpecs() {
      return Object.entries(AUTOMATION_PARAM_MAP).map(([id, spec]) => {
        if (spec.type === "enum") {
          return { id, steps: spec.values.length };
        }
        if (spec.type === "switch") {
          return { id, steps: 2 };
        }
        if (spec.steps) {
          return { id, steps: spec.steps };
        }
        return { id };
      });
    },
    getParameter(id: string) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      return toNormalized(spec, getParameter(id));
    },
    setParameter(id: string, value: number) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      setParameter(id, fromNormalized(spec, value));
    },
  };
}
