import { UPDATE_ENVELOPE } from './actions';

const initialState = {
  synthParams: {
    envelope: {
      attack: 0.0001,
      decay: 0.2,
      sustain: 0.2,
      release: 1,
    },
    portamento: 0.05,
  },
  filterParams: {
    frequency: 0,
    type: 'sine',
    depth: 1,
    baseFrequency: 500,
    octaves: 2.6,
    filter: {
      type: 'lowpass',
      rolloff: -12,
      Q: 1,
    },
  },
};

export default function(state = initialState, action) {
  const { type, envelopeName, envelopeValue, typeOfParams } = action;
  switch (type) {
    case UPDATE_ENVELOPE:
      if (typeOfParams === 'synthParams') {
        return {
          ...state,
          synthParams: {
            ...state.synthParams,
            envelope: {
              ...state.synthParams.envelope,
              [envelopeName]: envelopeValue,
            },
          },
        };
      }
      if (typeOfParams === 'filterParams') {
        return {
          ...state,
          filterParams: {
            ...state.filterParams,
            [envelopeName]: envelopeValue,
          },
        };
      }
      return state;
    default:
      return state;
  }
}
