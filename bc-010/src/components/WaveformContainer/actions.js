export const TOGGLE_OSCILLATORS = 'TOGGLE_OSCILLATORS';

export function toggleOscillators(oscType) {
  return {
    type: 'TOGGLE_OSCILLATORS',
    oscType,
  };
}
