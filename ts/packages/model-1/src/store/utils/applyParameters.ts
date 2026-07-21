import { SynthSettings } from "@/synth/types";
import { SynthActions } from "../types/synth";
import { ExportedParameters } from "./presetExporter";

type ApplyActions = Pick<
  SynthActions,
  | "setOctave"
  | "setGlide"
  | "updateMixer"
  | "setModWheel"
  | "setOscillator"
  | "updateNoise"
  | "updateModifiers"
  | "updateEffects"
  | "updateArpeggiator"
>;

export function applyPresetSettings(actions: ApplyActions, preset: SynthSettings) {
  applyOscillators(actions, preset.oscillators);
  actions.setOctave(preset.octave);
  actions.setGlide(preset.glide);
  actions.updateMixer({ modMix: preset.modMix });
  actions.setModWheel(preset.modWheel);
  actions.updateNoise(preset.noise);
  actions.updateModifiers({
    cutoff: preset.filter.cutoff,
    resonance: preset.filter.resonance,
    contourAmount: preset.filter.contourAmount,
    filterType: preset.filter.type,
    envelope: preset.envelope,
    lfo: preset.lfo,
  });
  actions.updateEffects({
    reverb: preset.reverb,
    distortion: preset.distortion,
    delay: preset.delay,
  });
}

export function applyExportedParameters(
  actions: ApplyActions,
  parameters: ExportedParameters
) {
  applyOscillators(actions, parameters.oscillators);
  actions.setOctave(parameters.octave);
  actions.setGlide(parameters.glide);
  actions.updateMixer({ modMix: parameters.modMix });
  actions.setModWheel(parameters.modWheel);
  actions.updateNoise(parameters.noise);
  actions.updateModifiers({
    cutoff: parameters.filter.cutoff,
    resonance: parameters.filter.resonance,
    contourAmount: parameters.filter.contourAmount,
    filterType: parameters.filter.type,
    envelope: parameters.envelope,
    lfo: parameters.lfo,
  });
  actions.updateEffects({
    reverb: parameters.reverb,
    distortion: parameters.distortion,
    delay: parameters.delay,
  });
  actions.updateArpeggiator(parameters.arpeggiator);
}

function applyOscillators(
  actions: ApplyActions,
  oscillators: ExportedParameters["oscillators"]
) {
  oscillators.forEach((osc, index) => {
    const id = (index + 1) as 1 | 2 | 3;
    const { volume, ...oscSettings } = osc;
    actions.setOscillator(id, {
      ...oscSettings,
      enabled: true,
    });
    if (volume !== undefined) {
      actions.updateMixer({ [`osc${id}Volume`]: volume });
    }
  });
}
