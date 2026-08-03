import { SynthoEngine, ModType } from "./audio/engine";
import { Vco } from "./audio/vco";

export type VcoParameters = {
  type: OscillatorType;
  octave: number;
  detune: number;
  gain: number;
  lfoMod: boolean;
};

export type SynthParameters = {
  vco1: VcoParameters;
  vco2: VcoParameters;
  vco3: VcoParameters;
  filter: {
    cutOff: number;
    peak: number;
    patch: ModType;
  };
  lfo: {
    type: OscillatorType;
    frequency: number;
    depth: number;
  };
  adsr: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  vca: {
    patch: ModType;
  };
};

export type PersistedSynthState = {
  parameters: SynthParameters;
};

function extractVcoParameters(vco: Vco): VcoParameters {
  return {
    type: vco.type,
    octave: vco.octave,
    detune: vco.detune,
    gain: vco.gain,
    lfoMod: vco.lfoMod,
  };
}

export function extractParameters(engine: SynthoEngine): SynthParameters {
  return {
    vco1: extractVcoParameters(engine.vco1),
    vco2: extractVcoParameters(engine.vco2),
    vco3: extractVcoParameters(engine.vco3),
    filter: {
      cutOff: engine.lpf.cutOff,
      peak: engine.lpf.peak,
      patch: engine.lpf.patch,
    },
    lfo: {
      type: engine.lfo.type,
      frequency: engine.lfo.frequency,
      depth: engine.lfo.depth,
    },
    adsr: {
      attack: engine.adsr.attack,
      decay: engine.adsr.decay,
      sustain: engine.adsr.sustain,
      release: engine.adsr.release,
    },
    vca: {
      patch: engine.vca.patch,
    },
  };
}

function applyVcoParameters(vco: Vco, parameters: VcoParameters) {
  vco.type = parameters.type;
  vco.octave = parameters.octave;
  vco.detune = parameters.detune;
  vco.gain = parameters.gain;
  vco.lfoMod = parameters.lfoMod;
}

export function applyParameters(
  engine: SynthoEngine,
  parameters: SynthParameters,
) {
  applyVcoParameters(engine.vco1, parameters.vco1);
  applyVcoParameters(engine.vco2, parameters.vco2);
  applyVcoParameters(engine.vco3, parameters.vco3);

  engine.lpf.cutOff = parameters.filter.cutOff;
  engine.lpf.peak = parameters.filter.peak;
  engine.patchFilter(parameters.filter.patch);

  engine.lfo.type = parameters.lfo.type;
  engine.lfo.frequency = parameters.lfo.frequency;
  engine.lfo.depth = parameters.lfo.depth;

  engine.adsr.attack = parameters.adsr.attack;
  engine.adsr.decay = parameters.adsr.decay;
  engine.adsr.sustain = parameters.adsr.sustain;
  engine.adsr.release = parameters.adsr.release;

  engine.patchVca(parameters.vca.patch);
}

function isVcoParameters(value: unknown): value is VcoParameters {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<VcoParameters>;
  return (
    typeof candidate.type === "string" &&
    typeof candidate.octave === "number" &&
    typeof candidate.detune === "number" &&
    typeof candidate.gain === "number" &&
    typeof candidate.lfoMod === "boolean"
  );
}

function isSynthParameters(value: unknown): value is SynthParameters {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SynthParameters>;
  return (
    isVcoParameters(candidate.vco1) &&
    isVcoParameters(candidate.vco2) &&
    isVcoParameters(candidate.vco3) &&
    candidate.filter !== undefined &&
    candidate.lfo !== undefined &&
    candidate.adsr !== undefined &&
    candidate.vca !== undefined
  );
}

export function parsePersistedState(state: unknown): SynthParameters | null {
  if (!state || typeof state !== "object") return null;

  const candidate = state as Partial<PersistedSynthState> & SynthParameters;
  if (isSynthParameters(candidate.parameters)) {
    return candidate.parameters;
  }
  if (isSynthParameters(candidate)) {
    return candidate;
  }
  return null;
}
