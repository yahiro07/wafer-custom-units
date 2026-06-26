export const DECREMENT_OCTAVE = 'DECREMENT_OCTAVE';
export const INCREMENT_OCTAVE = 'INCREMENT_OCTAVE';
export const SET_OCTAVE = 'SET_OCTAVE';

export function incrementOctave() {
  return {
    type: 'INCREMENT_OCTAVE',
  };
}

export function decrementOctave() {
  return {
    type: 'DECREMENT_OCTAVE',
  };
}

export function setOctave(newOctave) {
  return {
    type: 'SET_OCTAVE',
    newOctave,
  };
}
