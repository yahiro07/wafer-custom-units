// ============================================================
// SYNTH MODULAR — Core Audio Engine
// Pure Web Audio API, zero dependencies
// ============================================================

class SynthEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.compressor = null;
    this.voices = new Map();
    this.effects = {};
    this.lfo = null;
    this.lfoGain = null;
    this.lfoTarget = 'filter';
    this.lfoRunning = false;
    this.filterNode = null;
    this.params = {
      oscType: 'sawtooth',
      osc2Type: 'square',
      osc2Detune: 7,
      osc2Mix: 0.5,
      osc2Octave: 0,
      noiseLevel: 0,
      filterType: 'lowpass',
      filterCutoff: 5000,
      filterResonance: 1,
      filterEnvAmount: 0,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
      lfoRate: 4,
      lfoDepth: 0,
      lfoShape: 'sine',
      lfoTarget: 'filter',
      delayTime: 0.3,
      delayFeedback: 0.3,
      delayMix: 0.2,
      reverbMix: 0.2,
      reverbDecay: 2.5,
      distortionAmount: 0,
      chorusRate: 1.5,
      chorusDepth: 0.002,
      chorusMix: 0,
      masterVolume: 0.7,
      portamento: 0,
      octave: 0,
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master chain: filter -> effects -> compressor -> analyser -> master gain -> destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.params.masterVolume;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.ratio.value = 6;
    this.compressor.knee.value = 15;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.1;

    // Global filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = this.params.filterType;
    this.filterNode.frequency.value = this.params.filterCutoff;
    this.filterNode.Q.value = this.params.filterResonance;

    // Build effects chain
    this._buildEffects();

    // Routing: filter -> distortion -> chorus -> delay -> reverb -> compressor -> analyser -> master -> out
    this.filterNode.connect(this.effects.distortion.input);
    this.effects.distortion.output.connect(this.effects.chorus.input);
    this.effects.chorus.output.connect(this.effects.delay.input);
    this.effects.delay.output.connect(this.effects.reverb.input);
    this.effects.reverb.output.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // LFO
    this._buildLFO();

    this.initialized = true;
  }

  _buildEffects() {
    // --- Distortion ---
    const distCurve = this._makeDistortionCurve(0);
    const distNode = this.ctx.createWaveShaper();
    distNode.curve = distCurve;
    distNode.oversample = '4x';
    this.effects.distortion = { input: distNode, output: distNode, node: distNode };

    // --- Chorus (via delayed LFO-modulated signal) ---
    const chorusDry = this.ctx.createGain();
    const chorusWet = this.ctx.createGain();
    const chorusDelay = this.ctx.createDelay(0.05);
    const chorusLFO = this.ctx.createOscillator();
    const chorusLFOGain = this.ctx.createGain();
    const chorusMerge = this.ctx.createGain();

    chorusDry.gain.value = 1;
    chorusWet.gain.value = this.params.chorusMix;
    chorusDelay.delayTime.value = 0.005;
    chorusLFO.frequency.value = this.params.chorusRate;
    chorusLFO.type = 'sine';
    chorusLFOGain.gain.value = this.params.chorusDepth;

    chorusLFO.connect(chorusLFOGain);
    chorusLFOGain.connect(chorusDelay.delayTime);
    chorusLFO.start();

    // Input splits to dry and wet
    const chorusInput = this.ctx.createGain();
    chorusInput.connect(chorusDry);
    chorusInput.connect(chorusDelay);
    chorusDelay.connect(chorusWet);
    chorusDry.connect(chorusMerge);
    chorusWet.connect(chorusMerge);

    this.effects.chorus = {
      input: chorusInput, output: chorusMerge,
      wet: chorusWet, dry: chorusDry, delay: chorusDelay,
      lfo: chorusLFO, lfoGain: chorusLFOGain
    };

    // --- Delay ---
    const delayDry = this.ctx.createGain();
    const delayWet = this.ctx.createGain();
    const delayNode = this.ctx.createDelay(2.0);
    const delayFeedback = this.ctx.createGain();
    const delayFilter = this.ctx.createBiquadFilter();
    const delayMerge = this.ctx.createGain();

    delayDry.gain.value = 1;
    delayWet.gain.value = this.params.delayMix;
    delayNode.delayTime.value = this.params.delayTime;
    delayFeedback.gain.value = this.params.delayFeedback;
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 4000;

    const delayInput = this.ctx.createGain();
    delayInput.connect(delayDry);
    delayInput.connect(delayNode);
    delayNode.connect(delayFilter);
    delayFilter.connect(delayWet);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayDry.connect(delayMerge);
    delayWet.connect(delayMerge);

    this.effects.delay = {
      input: delayInput, output: delayMerge,
      wet: delayWet, dry: delayDry, node: delayNode,
      feedback: delayFeedback, filter: delayFilter
    };

    // --- Reverb (convolution) ---
    const reverbDry = this.ctx.createGain();
    const reverbWet = this.ctx.createGain();
    const reverbConvolver = this.ctx.createConvolver();
    const reverbMerge = this.ctx.createGain();

    reverbDry.gain.value = 1;
    reverbWet.gain.value = this.params.reverbMix;
    reverbConvolver.buffer = this._createReverbIR(this.params.reverbDecay);

    const reverbInput = this.ctx.createGain();
    reverbInput.connect(reverbDry);
    reverbInput.connect(reverbConvolver);
    reverbConvolver.connect(reverbWet);
    reverbDry.connect(reverbMerge);
    reverbWet.connect(reverbMerge);

    this.effects.reverb = {
      input: reverbInput, output: reverbMerge,
      wet: reverbWet, dry: reverbDry, convolver: reverbConvolver
    };
  }

  _buildLFO() {
    this.lfo = this.ctx.createOscillator();
    this.lfoGain = this.ctx.createGain();
    this.lfo.type = this.params.lfoShape;
    this.lfo.frequency.value = this.params.lfoRate;
    this.lfoGain.gain.value = 0;
    this.lfo.connect(this.lfoGain);
    this._routeLFO();
    this.lfo.start();
    this.lfoRunning = true;
  }

  _routeLFO() {
    if (!this.lfoGain) return;
    this.lfoGain.disconnect();
    const target = this.params.lfoTarget;
    if (target === 'filter') {
      this.lfoGain.gain.value = this.params.lfoDepth * this.params.filterCutoff * 0.5;
      this.lfoGain.connect(this.filterNode.frequency);
    } else if (target === 'pitch') {
      this.lfoGain.gain.value = this.params.lfoDepth * 100;
      // Connected per-voice
    } else if (target === 'amplitude') {
      this.lfoGain.gain.value = this.params.lfoDepth * 0.5;
      this.lfoGain.connect(this.masterGain.gain);
    } else if (target === 'pan') {
      this.lfoGain.gain.value = this.params.lfoDepth;
    }
  }

  _makeDistortionCurve(amount) {
    const k = amount * 100;
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
      }
    }
    return curve;
  }

  _createReverbIR(decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * decay;
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.8);
      }
    }
    return buffer;
  }

  noteOn(note, velocity = 1.0) {
    if (!this.initialized) return;
    const freq = 440 * Math.pow(2, (note - 69 + this.params.octave * 12) / 12);
    const t = this.ctx.currentTime;

    // Kill existing voice for this note
    this.noteOff(note);

    const voice = {};

    // Osc 1
    voice.osc1 = this.ctx.createOscillator();
    voice.osc1.type = this.params.oscType;
    voice.osc1.frequency.value = freq;

    // Osc 2
    voice.osc2 = this.ctx.createOscillator();
    voice.osc2.type = this.params.osc2Type;
    voice.osc2.frequency.value = freq * Math.pow(2, this.params.osc2Octave);
    voice.osc2.detune.value = this.params.osc2Detune;

    voice.osc2Gain = this.ctx.createGain();
    voice.osc2Gain.gain.value = this.params.osc2Mix;

    // Noise
    voice.noiseGain = this.ctx.createGain();
    voice.noiseGain.gain.value = this.params.noiseLevel;
    if (this.params.noiseLevel > 0) {
      voice.noise = this._createNoiseSource();
      voice.noise.connect(voice.noiseGain);
    }

    // VCA (envelope)
    voice.vca = this.ctx.createGain();
    voice.vca.gain.setValueAtTime(0, t);
    voice.vca.gain.linearRampToValueAtTime(velocity, t + this.params.attack);
    voice.vca.gain.linearRampToValueAtTime(
      velocity * this.params.sustain,
      t + this.params.attack + this.params.decay
    );

    // Filter envelope
    if (this.params.filterEnvAmount > 0) {
      const baseFreq = this.params.filterCutoff;
      const envFreq = baseFreq + this.params.filterEnvAmount * 8000;
      this.filterNode.frequency.setValueAtTime(envFreq, t);
      this.filterNode.frequency.linearRampToValueAtTime(
        baseFreq + (envFreq - baseFreq) * 0.3,
        t + this.params.attack + this.params.decay
      );
    }

    // Connect: oscs -> vca -> filter
    voice.osc1.connect(voice.vca);
    voice.osc2.connect(voice.osc2Gain);
    voice.osc2Gain.connect(voice.vca);
    voice.noiseGain.connect(voice.vca);
    voice.vca.connect(this.filterNode);

    // LFO pitch connection
    if (this.params.lfoTarget === 'pitch' && this.params.lfoDepth > 0) {
      this.lfoGain.connect(voice.osc1.detune);
      this.lfoGain.connect(voice.osc2.detune);
    }

    voice.osc1.start(t);
    voice.osc2.start(t);

    voice.note = note;
    this.voices.set(note, voice);
  }

  noteOff(note) {
    const voice = this.voices.get(note);
    if (!voice) return;
    const t = this.ctx.currentTime;
    voice.vca.gain.cancelScheduledValues(t);
    voice.vca.gain.setValueAtTime(voice.vca.gain.value, t);
    voice.vca.gain.linearRampToValueAtTime(0, t + this.params.release);

    const releaseTime = this.params.release + 0.05;
    voice.osc1.stop(t + releaseTime);
    voice.osc2.stop(t + releaseTime);
    if (voice.noise) voice.noise.stop(t + releaseTime);

    setTimeout(() => {
      try {
        voice.vca.disconnect();
      } catch (e) {}
    }, (releaseTime + 0.1) * 1000);

    this.voices.delete(note);
  }

  allNotesOff() {
    for (const note of this.voices.keys()) {
      this.noteOff(note);
    }
  }

  _createNoiseSource() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    return source;
  }

  setParam(name, value) {
    this.params[name] = value;
    if (!this.initialized) return;

    switch (name) {
      case 'masterVolume':
        this.masterGain.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'filterCutoff':
        this.filterNode.frequency.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        if (this.params.lfoTarget === 'filter') {
          this.lfoGain.gain.value = this.params.lfoDepth * value * 0.5;
        }
        break;
      case 'filterResonance':
        this.filterNode.Q.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'filterType':
        this.filterNode.type = value;
        break;
      case 'delayTime':
        this.effects.delay.node.delayTime.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'delayFeedback':
        this.effects.delay.feedback.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'delayMix':
        this.effects.delay.wet.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'reverbMix':
        this.effects.reverb.wet.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'reverbDecay':
        this.effects.reverb.convolver.buffer = this._createReverbIR(value);
        break;
      case 'distortionAmount':
        this.effects.distortion.node.curve = this._makeDistortionCurve(value);
        break;
      case 'chorusRate':
        this.effects.chorus.lfo.frequency.value = value;
        break;
      case 'chorusDepth':
        this.effects.chorus.lfoGain.gain.value = value;
        break;
      case 'chorusMix':
        this.effects.chorus.wet.gain.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'lfoRate':
        this.lfo.frequency.linearRampToValueAtTime(value, this.ctx.currentTime + 0.05);
        break;
      case 'lfoDepth':
        this._routeLFO();
        break;
      case 'lfoShape':
        this.lfo.type = value;
        break;
      case 'lfoTarget':
        this._routeLFO();
        break;
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getWaveformData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

// ============================================================
// SEQUENCER ENGINE
// ============================================================

class Sequencer {
  constructor(synthEngine) {
    this.synth = synthEngine;
    this.steps = 16;
    this.bpm = 120;
    this.currentStep = -1;
    this.running = false;
    this.intervalId = null;
    this.pattern = [];
    this.onStep = null; // callback(stepIndex)

    // Initialize empty pattern
    for (let i = 0; i < this.steps; i++) {
      this.pattern.push({
        active: false,
        note: 60,   // C4
        velocity: 0.8,
        slide: false
      });
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.currentStep = -1;
    this._tick();
    this._scheduleNext();
  }

  stop() {
    this.running = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.synth.allNotesOff();
    this.currentStep = -1;
    if (this.onStep) this.onStep(-1);
  }

  _scheduleNext() {
    if (!this.running) return;
    const stepDuration = (60 / this.bpm) * 1000 / 4; // 16th notes
    this.intervalId = setTimeout(() => {
      this._tick();
      this._scheduleNext();
    }, stepDuration);
  }

  _tick() {
    this.currentStep = (this.currentStep + 1) % this.steps;
    const step = this.pattern[this.currentStep];

    // Note off previous
    this.synth.allNotesOff();

    if (step.active) {
      this.synth.noteOn(step.note, step.velocity);
    }

    if (this.onStep) this.onStep(this.currentStep);
  }

  setStep(index, data) {
    Object.assign(this.pattern[index], data);
  }

  toggleStep(index) {
    this.pattern[index].active = !this.pattern[index].active;
    return this.pattern[index].active;
  }

  setStepNote(index, note) {
    this.pattern[index].note = note;
  }

  setBPM(bpm) {
    this.bpm = Math.max(30, Math.min(300, bpm));
  }

  loadPattern(pattern) {
    this.pattern = pattern.map(s => ({ ...s }));
  }

  getPattern() {
    return this.pattern.map(s => ({ ...s }));
  }

  randomize(scale, baseNote = 48) {
    const scaleNotes = SCALES[scale] || SCALES.minor;
    for (let i = 0; i < this.steps; i++) {
      this.pattern[i].active = Math.random() > 0.35;
      const degree = Math.floor(Math.random() * scaleNotes.length);
      const octaveOffset = Math.floor(Math.random() * 3) * 12;
      this.pattern[i].note = baseNote + scaleNotes[degree] + octaveOffset;
      this.pattern[i].velocity = 0.5 + Math.random() * 0.5;
    }
  }
}

// Scale definitions
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  wholeTone: [0, 2, 4, 6, 8, 10],
  arabic: [0, 1, 4, 5, 7, 8, 11],
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteToName(note) {
  return NOTE_NAMES[note % 12] + Math.floor(note / 12 - 1);
}

function nameToNote(name) {
  const match = name.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60;
  const idx = NOTE_NAMES.indexOf(match[1]);
  const oct = parseInt(match[2]);
  return (oct + 1) * 12 + idx;
}
