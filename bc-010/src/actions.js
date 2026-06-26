export const UPDATE_ENVELOPE = 'UPDATE_ENVELOPE';

// TODO: pass in another argument to tell this what slider bank to update
export function updateEnvelope(envelopeName, envelopeValue, typeOfParams) {
  return {
    type: 'UPDATE_ENVELOPE',
    envelopeName,
    envelopeValue,
    typeOfParams,
  };
}
