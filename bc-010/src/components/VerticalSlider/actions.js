export const UPDATE_SYNTH_ENVELOPE = 'UPDATE_SYNTH_ENVELOPE';
export const UPDATE_FILTER_ENVELOPE = 'UPDATE_FILTER_ENVELOPE';
export const UPDATE_ALL_SYNTH_ENVELOPES = 'UPDATE_ALL_SYNTH_ENVELOPES';
export const UPDATE_ALL_FILTER_ENVELOPES = 'UPDATE_ALL_FILTER_ENVELOPES';

// TODO: pass in another argument to tell this what slider bank to update
export function updateSynthEnvelope(envelopeName, envelopeValue) {
  return {
    type: 'UPDATE_SYNTH_ENVELOPE',
    envelopeName,
    envelopeValue,
  };
}

export function updateAllSynthEnvelopes(envelopeObj) {
  return {
    type: 'UPDATE_ALL_SYNTH_ENVELOPES',
    envelopeObj,
  };
}

export function updateFilterEnvelope(envelopeName, envelopeValue) {
  return {
    type: 'UPDATE_FILTER_ENVELOPE',
    envelopeName,
    envelopeValue,
  };
}

export function updateAllFilterEnvelopes(filterObj) {
  return {
    type: 'UPDATE_ALL_FILTER_ENVELOPES',
    filterObj,
  };
}
