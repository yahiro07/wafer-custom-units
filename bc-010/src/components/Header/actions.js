export const UPDATE_SYNTH_PATCH = 'UPDATE_SYNTH_PATCH';

export function updateSynthPatch(synthPatch) {
  return {
    type: 'UPDATE_SYNTH_PATCH',
    synthPatch,
  };
}
