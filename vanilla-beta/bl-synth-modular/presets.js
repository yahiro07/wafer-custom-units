// ============================================================
// SYNTH MODULAR — Preset Library
// ============================================================

const PRESETS = {
  // === CLASSIC SYNTH SOUNDS ===
  "Init": {
    oscType: 'sawtooth', osc2Type: 'square', osc2Detune: 7, osc2Mix: 0.5, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 5000, filterResonance: 1, filterEnvAmount: 0,
    attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5,
    lfoRate: 4, lfoDepth: 0, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.3, delayFeedback: 0.3, delayMix: 0, reverbMix: 0.1, reverbDecay: 2,
    distortionAmount: 0, chorusRate: 1.5, chorusDepth: 0.002, chorusMix: 0,
    masterVolume: 0.7, octave: 0
  },

  "Fat Bass": {
    oscType: 'sawtooth', osc2Type: 'square', osc2Detune: 5, osc2Mix: 0.7, osc2Octave: -1,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 800, filterResonance: 4, filterEnvAmount: 0.6,
    attack: 0.005, decay: 0.4, sustain: 0.4, release: 0.15,
    lfoRate: 0.5, lfoDepth: 0, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.3, delayFeedback: 0.1, delayMix: 0, reverbMix: 0.05, reverbDecay: 1,
    distortionAmount: 0.2, chorusRate: 0.8, chorusDepth: 0.001, chorusMix: 0,
    masterVolume: 0.8, octave: -1
  },

  "Acid Squelch": {
    oscType: 'sawtooth', osc2Type: 'sawtooth', osc2Detune: 0, osc2Mix: 0, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 400, filterResonance: 15, filterEnvAmount: 0.9,
    attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1,
    lfoRate: 6, lfoDepth: 0, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.375, delayFeedback: 0.4, delayMix: 0.25, reverbMix: 0.1, reverbDecay: 1.5,
    distortionAmount: 0.3, chorusRate: 1, chorusDepth: 0.001, chorusMix: 0,
    masterVolume: 0.7, octave: 0
  },

  "Classic Lead": {
    oscType: 'sawtooth', osc2Type: 'sawtooth', osc2Detune: 12, osc2Mix: 0.6, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 3000, filterResonance: 3, filterEnvAmount: 0.3,
    attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.3,
    lfoRate: 5, lfoDepth: 0.15, lfoShape: 'sine', lfoTarget: 'pitch',
    delayTime: 0.35, delayFeedback: 0.35, delayMix: 0.25, reverbMix: 0.2, reverbDecay: 2,
    distortionAmount: 0.1, chorusRate: 2, chorusDepth: 0.003, chorusMix: 0.3,
    masterVolume: 0.7, octave: 0
  },

  "Warm Pad": {
    oscType: 'sawtooth', osc2Type: 'triangle', osc2Detune: 8, osc2Mix: 0.6, osc2Octave: 0,
    noiseLevel: 0.05, filterType: 'lowpass', filterCutoff: 2500, filterResonance: 0.5, filterEnvAmount: 0.1,
    attack: 0.8, decay: 1.0, sustain: 0.8, release: 2.0,
    lfoRate: 0.3, lfoDepth: 0.2, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.5, delayFeedback: 0.3, delayMix: 0.2, reverbMix: 0.5, reverbDecay: 4,
    distortionAmount: 0, chorusRate: 0.7, chorusDepth: 0.004, chorusMix: 0.5,
    masterVolume: 0.6, octave: 0
  },

  "Brass Stab": {
    oscType: 'sawtooth', osc2Type: 'sawtooth', osc2Detune: 3, osc2Mix: 0.8, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 1200, filterResonance: 2, filterEnvAmount: 0.7,
    attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.2,
    lfoRate: 6, lfoDepth: 0, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.25, delayFeedback: 0.2, delayMix: 0.1, reverbMix: 0.2, reverbDecay: 1.5,
    distortionAmount: 0.1, chorusRate: 2, chorusDepth: 0.002, chorusMix: 0.2,
    masterVolume: 0.7, octave: 0
  },

  "Pluck": {
    oscType: 'triangle', osc2Type: 'square', osc2Detune: 2, osc2Mix: 0.4, osc2Octave: 1,
    noiseLevel: 0.1, filterType: 'lowpass', filterCutoff: 6000, filterResonance: 1, filterEnvAmount: 0.5,
    attack: 0.001, decay: 0.3, sustain: 0, release: 0.2,
    lfoRate: 4, lfoDepth: 0, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.2, delayFeedback: 0.4, delayMix: 0.3, reverbMix: 0.3, reverbDecay: 2,
    distortionAmount: 0, chorusRate: 1.5, chorusDepth: 0.002, chorusMix: 0.2,
    masterVolume: 0.7, octave: 0
  },

  "PWM Strings": {
    oscType: 'sawtooth', osc2Type: 'sawtooth', osc2Detune: 15, osc2Mix: 0.5, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 3500, filterResonance: 0.5, filterEnvAmount: 0,
    attack: 0.5, decay: 0.5, sustain: 0.9, release: 1.5,
    lfoRate: 0.2, lfoDepth: 0.15, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.4, delayFeedback: 0.2, delayMix: 0.15, reverbMix: 0.5, reverbDecay: 3.5,
    distortionAmount: 0, chorusRate: 0.5, chorusDepth: 0.005, chorusMix: 0.6,
    masterVolume: 0.6, octave: 0
  },

  "Sync Lead": {
    oscType: 'sawtooth', osc2Type: 'square', osc2Detune: 0, osc2Mix: 0.3, osc2Octave: 1,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 4000, filterResonance: 5, filterEnvAmount: 0.5,
    attack: 0.005, decay: 0.3, sustain: 0.6, release: 0.3,
    lfoRate: 6, lfoDepth: 0.1, lfoShape: 'sine', lfoTarget: 'pitch',
    delayTime: 0.3, delayFeedback: 0.35, delayMix: 0.3, reverbMix: 0.15, reverbDecay: 1.5,
    distortionAmount: 0.15, chorusRate: 2, chorusDepth: 0.003, chorusMix: 0.2,
    masterVolume: 0.7, octave: 0
  },

  "Organ": {
    oscType: 'sine', osc2Type: 'sine', osc2Detune: 0, osc2Mix: 0.6, osc2Octave: 1,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 8000, filterResonance: 0.5, filterEnvAmount: 0,
    attack: 0.005, decay: 0.1, sustain: 1.0, release: 0.05,
    lfoRate: 6, lfoDepth: 0.08, lfoShape: 'sine', lfoTarget: 'amplitude',
    delayTime: 0.3, delayFeedback: 0.1, delayMix: 0, reverbMix: 0.3, reverbDecay: 2,
    distortionAmount: 0.05, chorusRate: 3, chorusDepth: 0.003, chorusMix: 0.4,
    masterVolume: 0.7, octave: 0
  },

  "Sci-Fi FX": {
    oscType: 'sawtooth', osc2Type: 'sine', osc2Detune: 50, osc2Mix: 0.7, osc2Octave: 1,
    noiseLevel: 0.15, filterType: 'bandpass', filterCutoff: 2000, filterResonance: 10, filterEnvAmount: 0.8,
    attack: 0.3, decay: 1.0, sustain: 0.3, release: 2.0,
    lfoRate: 8, lfoDepth: 0.6, lfoShape: 'sawtooth', lfoTarget: 'filter',
    delayTime: 0.5, delayFeedback: 0.6, delayMix: 0.4, reverbMix: 0.5, reverbDecay: 4,
    distortionAmount: 0.1, chorusRate: 3, chorusDepth: 0.005, chorusMix: 0.3,
    masterVolume: 0.5, octave: 0
  },

  "Noise Sweep": {
    oscType: 'sine', osc2Type: 'sine', osc2Detune: 0, osc2Mix: 0, osc2Octave: 0,
    noiseLevel: 0.8, filterType: 'bandpass', filterCutoff: 1000, filterResonance: 8, filterEnvAmount: 0,
    attack: 0.5, decay: 2.0, sustain: 0.3, release: 1.5,
    lfoRate: 0.1, lfoDepth: 0.8, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.6, delayFeedback: 0.5, delayMix: 0.3, reverbMix: 0.6, reverbDecay: 5,
    distortionAmount: 0, chorusRate: 0.5, chorusDepth: 0.004, chorusMix: 0.3,
    masterVolume: 0.5, octave: 0
  },

  "Wobble Bass": {
    oscType: 'sawtooth', osc2Type: 'square', osc2Detune: 0, osc2Mix: 0.7, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 600, filterResonance: 8, filterEnvAmount: 0,
    attack: 0.005, decay: 0.2, sustain: 0.8, release: 0.15,
    lfoRate: 3, lfoDepth: 0.7, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.25, delayFeedback: 0.1, delayMix: 0, reverbMix: 0.05, reverbDecay: 1,
    distortionAmount: 0.4, chorusRate: 1, chorusDepth: 0.001, chorusMix: 0,
    masterVolume: 0.7, octave: -1
  },

  "Ethereal Keys": {
    oscType: 'triangle', osc2Type: 'sine', osc2Detune: 6, osc2Mix: 0.5, osc2Octave: 1,
    noiseLevel: 0.02, filterType: 'lowpass', filterCutoff: 4000, filterResonance: 1, filterEnvAmount: 0.2,
    attack: 0.05, decay: 0.5, sustain: 0.4, release: 1.5,
    lfoRate: 0.5, lfoDepth: 0.1, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.45, delayFeedback: 0.45, delayMix: 0.35, reverbMix: 0.5, reverbDecay: 4,
    distortionAmount: 0, chorusRate: 0.8, chorusDepth: 0.004, chorusMix: 0.4,
    masterVolume: 0.6, octave: 0
  },

  "Hoover": {
    oscType: 'sawtooth', osc2Type: 'sawtooth', osc2Detune: 25, osc2Mix: 0.8, osc2Octave: 0,
    noiseLevel: 0.05, filterType: 'lowpass', filterCutoff: 2000, filterResonance: 3, filterEnvAmount: 0.4,
    attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.3,
    lfoRate: 4, lfoDepth: 0.3, lfoShape: 'sawtooth', lfoTarget: 'pitch',
    delayTime: 0.3, delayFeedback: 0.2, delayMix: 0.15, reverbMix: 0.2, reverbDecay: 2,
    distortionAmount: 0.2, chorusRate: 2, chorusDepth: 0.005, chorusMix: 0.4,
    masterVolume: 0.7, octave: 0
  },

  "Sub Bass": {
    oscType: 'sine', osc2Type: 'sine', osc2Detune: 0, osc2Mix: 0, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 300, filterResonance: 0.5, filterEnvAmount: 0.2,
    attack: 0.01, decay: 0.5, sustain: 0.8, release: 0.3,
    lfoRate: 0.3, lfoDepth: 0, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.3, delayFeedback: 0, delayMix: 0, reverbMix: 0, reverbDecay: 1,
    distortionAmount: 0.1, chorusRate: 1, chorusDepth: 0, chorusMix: 0,
    masterVolume: 0.8, octave: -2
  },

  "Reese Bass": {
    oscType: 'sawtooth', osc2Type: 'sawtooth', osc2Detune: 10, osc2Mix: 1.0, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 1200, filterResonance: 2, filterEnvAmount: 0.3,
    attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.2,
    lfoRate: 0.1, lfoDepth: 0.15, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.3, delayFeedback: 0, delayMix: 0, reverbMix: 0.05, reverbDecay: 1,
    distortionAmount: 0.15, chorusRate: 0.5, chorusDepth: 0.002, chorusMix: 0.2,
    masterVolume: 0.7, octave: -1
  },

  "Blade Runner": {
    oscType: 'sawtooth', osc2Type: 'triangle', osc2Detune: 20, osc2Mix: 0.5, osc2Octave: 0,
    noiseLevel: 0.03, filterType: 'lowpass', filterCutoff: 1800, filterResonance: 2, filterEnvAmount: 0,
    attack: 1.5, decay: 1.0, sustain: 0.7, release: 3.0,
    lfoRate: 0.15, lfoDepth: 0.25, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.6, delayFeedback: 0.4, delayMix: 0.3, reverbMix: 0.6, reverbDecay: 5,
    distortionAmount: 0, chorusRate: 0.3, chorusDepth: 0.006, chorusMix: 0.5,
    masterVolume: 0.5, octave: 0
  },

  "Chip Lead": {
    oscType: 'square', osc2Type: 'square', osc2Detune: 0, osc2Mix: 0, osc2Octave: 0,
    noiseLevel: 0, filterType: 'lowpass', filterCutoff: 8000, filterResonance: 0.5, filterEnvAmount: 0,
    attack: 0.001, decay: 0.1, sustain: 0.8, release: 0.05,
    lfoRate: 6, lfoDepth: 0, lfoShape: 'square', lfoTarget: 'pitch',
    delayTime: 0.15, delayFeedback: 0.3, delayMix: 0.15, reverbMix: 0.1, reverbDecay: 1,
    distortionAmount: 0, chorusRate: 1, chorusDepth: 0, chorusMix: 0,
    masterVolume: 0.6, octave: 1
  },

  "Ambient Drone": {
    oscType: 'sine', osc2Type: 'triangle', osc2Detune: 3, osc2Mix: 0.6, osc2Octave: -1,
    noiseLevel: 0.08, filterType: 'lowpass', filterCutoff: 1500, filterResonance: 0.5, filterEnvAmount: 0,
    attack: 3.0, decay: 2.0, sustain: 0.9, release: 5.0,
    lfoRate: 0.05, lfoDepth: 0.3, lfoShape: 'sine', lfoTarget: 'filter',
    delayTime: 0.8, delayFeedback: 0.5, delayMix: 0.4, reverbMix: 0.7, reverbDecay: 6,
    distortionAmount: 0, chorusRate: 0.2, chorusDepth: 0.006, chorusMix: 0.5,
    masterVolume: 0.5, octave: -1
  },
};

// ============================================================
// SEQUENCER PRESETS
// ============================================================

const SEQ_PRESETS = {
  "Empty": {
    bpm: 120,
    pattern: Array.from({ length: 16 }, () => ({ active: false, note: 60, velocity: 0.8, slide: false }))
  },

  "Acid Line": {
    bpm: 138,
    pattern: [
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.7, slide: false },
      { active: true, note: 39, velocity: 0.9, slide: true },
      { active: true, note: 48, velocity: 1.0, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.6, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 41, velocity: 0.9, slide: false },
      { active: true, note: 36, velocity: 0.7, slide: true },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 43, velocity: 1.0, slide: false },
      { active: true, note: 36, velocity: 0.8, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 48, velocity: 0.9, slide: true },
      { active: true, note: 46, velocity: 0.7, slide: false },
    ]
  },

  "Techno Pulse": {
    bpm: 130,
    pattern: [
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.9, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: true, note: 43, velocity: 0.7, slide: true },
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.9, slide: false },
      { active: true, note: 39, velocity: 0.6, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
    ]
  },

  "Arpeggio Up": {
    bpm: 128,
    pattern: [
      { active: true, note: 48, velocity: 1.0, slide: false },
      { active: true, note: 51, velocity: 0.8, slide: false },
      { active: true, note: 55, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 0.9, slide: false },
      { active: true, note: 48, velocity: 0.7, slide: false },
      { active: true, note: 51, velocity: 0.8, slide: false },
      { active: true, note: 55, velocity: 0.8, slide: false },
      { active: true, note: 63, velocity: 1.0, slide: false },
      { active: true, note: 48, velocity: 0.9, slide: false },
      { active: true, note: 51, velocity: 0.8, slide: false },
      { active: true, note: 55, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 0.7, slide: false },
      { active: true, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 51, velocity: 0.8, slide: false },
      { active: true, note: 55, velocity: 0.9, slide: false },
      { active: true, note: 58, velocity: 1.0, slide: false },
    ]
  },

  "Trance Gate": {
    bpm: 140,
    pattern: [
      { active: true, note: 60, velocity: 1.0, slide: false },
      { active: true, note: 60, velocity: 0.6, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 0.8, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 0.9, slide: false },
      { active: true, note: 60, velocity: 0.5, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 1.0, slide: false },
      { active: true, note: 60, velocity: 0.6, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 0.7, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 60, velocity: 0.9, slide: false },
      { active: true, note: 60, velocity: 0.4, slide: false },
      { active: true, note: 60, velocity: 0.7, slide: false },
    ]
  },

  "Funk Bass": {
    bpm: 110,
    pattern: [
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.6, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 39, velocity: 0.8, slide: false },
      { active: true, note: 41, velocity: 0.9, slide: true },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 43, velocity: 0.7, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: true, note: 41, velocity: 0.9, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 39, velocity: 0.7, slide: true },
    ]
  },

  "Ambient Sequence": {
    bpm: 85,
    pattern: [
      { active: true, note: 60, velocity: 0.6, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 67, velocity: 0.4, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 63, velocity: 0.5, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 72, velocity: 0.3, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 65, velocity: 0.5, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 70, velocity: 0.4, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 67, velocity: 0.6, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: false, note: 60, velocity: 0.8, slide: false },
      { active: true, note: 63, velocity: 0.3, slide: false },
    ]
  },

  "Electro Stab": {
    bpm: 125,
    pattern: [
      { active: true, note: 48, velocity: 1.0, slide: false },
      { active: true, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 51, velocity: 0.9, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 55, velocity: 1.0, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 48, velocity: 0.7, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 53, velocity: 0.9, slide: false },
      { active: true, note: 48, velocity: 0.6, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 55, velocity: 1.0, slide: false },
      { active: true, note: 53, velocity: 0.8, slide: true },
      { active: false, note: 48, velocity: 0.8, slide: false },
    ]
  },

  "Detroit Loop": {
    bpm: 132,
    pattern: [
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: true, note: 48, velocity: 0.7, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: true, note: 36, velocity: 0.9, slide: false },
      { active: false, note: 36, velocity: 0.8, slide: false },
      { active: true, note: 43, velocity: 0.8, slide: true },
      { active: true, note: 36, velocity: 0.4, slide: false },
      { active: true, note: 36, velocity: 1.0, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: true, note: 46, velocity: 0.7, slide: false },
      { active: true, note: 36, velocity: 0.5, slide: false },
      { active: true, note: 36, velocity: 0.9, slide: false },
      { active: true, note: 41, velocity: 0.6, slide: false },
      { active: true, note: 48, velocity: 0.8, slide: true },
      { active: true, note: 43, velocity: 0.5, slide: false },
    ]
  },

  "Minimal Step": {
    bpm: 122,
    pattern: [
      { active: true, note: 48, velocity: 0.9, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 48, velocity: 0.6, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 51, velocity: 0.7, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 53, velocity: 0.9, slide: true },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: false, note: 48, velocity: 0.8, slide: false },
      { active: true, note: 48, velocity: 0.5, slide: false },
    ]
  },
};
