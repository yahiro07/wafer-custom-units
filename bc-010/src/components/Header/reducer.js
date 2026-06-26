import { UPDATE_SYNTH_PATCH } from './actions';

const initialSynthPreset = {
  attack: 0.0001,
  decay: 0.2,
  sustain: 0.2,
  release: 1,
};

export function synthPatchReducer(state = initialSynthPreset, action) {
  const { type, synthPatch } = action;
  switch (type) {
    case UPDATE_SYNTH_PATCH:
      return {
        ...state,
        synthesizer: {
          envelope: {
            ...state.synthesizer.envelope,
            ...synthPatch,
          },
        },
      };
    default:
      return state;
  }
}
