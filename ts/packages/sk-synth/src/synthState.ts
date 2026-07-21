import * as Tone from "tone";
import { effects } from "./Components/Control/Effect";

export type OscillatorType = "sawtooth" | "square" | "sine8";

export type SynthParameters = {
  oscillatorType: OscillatorType;
  pitchShift: {
    enabled: boolean;
    pitch: number;
  };
  filter: {
    enabled: boolean;
    sensitivity: number;
  };
  distortion: {
    enabled: boolean;
    amount: number;
  };
};

export type PersistedSynthState = {
  parameters: SynthParameters;
};

export const DEFAULT_PARAMETERS: SynthParameters = {
  oscillatorType: "sawtooth",
  pitchShift: {
    enabled: false,
    pitch: 5,
  },
  filter: {
    enabled: false,
    sensitivity: 5,
  },
  distortion: {
    enabled: false,
    amount: 1,
  },
};

export function applyParameters(
  synth: Tone.MonoSynth,
  parameters: SynthParameters,
) {
  synth.oscillator.type = parameters.oscillatorType;

  effects.pitchShift.object.wet.value = Number(parameters.pitchShift.enabled);
  effects.pitchShift.object.pitch = parameters.pitchShift.pitch;

  effects.filter.object.wet.value = Number(parameters.filter.enabled);
  effects.filter.object.sensitivity = parameters.filter.sensitivity;

  effects.distortion.object.wet.value = Number(parameters.distortion.enabled);
  effects.distortion.object.distortion = parameters.distortion.amount;
}

export function parsePersistedState(state: unknown): SynthParameters | null {
  if (!state || typeof state !== "object") return null;

  const candidate = state as Partial<PersistedSynthState> & SynthParameters;
  const parameters =
    candidate.parameters && typeof candidate.parameters === "object"
      ? candidate.parameters
      : isSynthParameters(candidate)
        ? candidate
        : null;

  if (!parameters) return null;

  return {
    ...DEFAULT_PARAMETERS,
    ...parameters,
    pitchShift: { ...DEFAULT_PARAMETERS.pitchShift, ...parameters.pitchShift },
    filter: { ...DEFAULT_PARAMETERS.filter, ...parameters.filter },
    distortion: { ...DEFAULT_PARAMETERS.distortion, ...parameters.distortion },
  };
}

function isSynthParameters(value: object): value is SynthParameters {
  return "oscillatorType" in value;
}
