class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.isPlaying = false;
    this.mood = 'Calm'; // 'Calm' -> LoFi, 'Deep' -> Synthwave, 'Ethereal' -> Dream Pop
    this.nextNoteTime = 0;
    this.current16thNote = 0;
    this.lookahead = 25.0; 
    this.scheduleAheadTime = 0.1;
    this.timerID = null;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    
    // Global Reverb
    this.reverb = this.createReverb(2.5);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.3;
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);

    // Progressions (Chords as arrays of MIDI notes)
    this.chordProgressions = {
      // Cmaj7, Am9, Fmaj7, G7 (LoFi chillhop)
      Calm: [ [60, 64, 67, 71], [57, 60, 64, 71], [53, 57, 60, 64], [55, 59, 62, 65] ],
      // Cm9, Fm9, Abmaj7, G7 (Darker/Deeper groove)
      Deep: [ [60, 63, 67, 70, 74], [53, 56, 60, 63, 67], [56, 60, 63, 67], [55, 59, 62, 65] ],
      // Fmaj7, G, Em7, Am (Upbeat dreamy pop)
      Ethereal: [ [65, 69, 72, 76], [67, 71, 74], [64, 67, 71, 74], [69, 72, 76] ]
    };
    
    // BPMs
    this.tempos = { Calm: 75, Deep: 85, Ethereal: 95 };
  }

  createReverb(duration) {
    const convolver = this.ctx.createConvolver();
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (rate * (duration / 2)));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    convolver.buffer = impulse;
    return convolver;
  }

  setMood(mood) {
    this.mood = mood;
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
    }
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // --- DRUMS ---
  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  playSnare(time) {
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;
    noise.connect(filter);

    const gain = this.ctx.createGain();
    filter.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverb); // A bit of reverb on snare
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.start(time);
  }

  playHihat(time, type = 'closed') {
    const duration = type === 'closed' ? 0.05 : 0.2;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    
    const gain = this.ctx.createGain();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  // --- SYNTHS ---
  playChord(notes, time, duration) {
    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Deep is more synthwave, Calm is smooth triangle
      osc.type = this.mood === 'Deep' ? 'sawtooth' : 'triangle';
      osc.frequency.value = this.midiToFreq(note);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, time);
      if (this.mood === 'Deep') {
        filter.frequency.linearRampToValueAtTime(300, time + duration);
      }

      const attack = 0.05;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + attack);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.reverb);

      osc.start(time);
      osc.stop(time + duration + 0.1);
    });
  }

  playBass(note, time, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = this.mood === 'Deep' ? 'square' : 'sine';
    // Drop 2 octaves for deep bass
    osc.frequency.value = this.midiToFreq(note - 24);
    
    filter.type = 'lowpass';
    filter.frequency.value = 250;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.02);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  playMelody(note, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = this.midiToFreq(note + 12); // Octave up
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverb);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  // --- SEQUENCER ---
  nextNote() {
    const secondsPerBeat = 60.0 / this.tempos[this.mood];
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note length
    this.current16thNote++;
    if (this.current16thNote === 64) {
      this.current16thNote = 0; // Loop every 4 bars (64 16th notes)
    }
  }

  scheduleNote(beatNumber, time) {
    const bar = Math.floor(beatNumber / 16);
    const stepInBar = beatNumber % 16;
    
    const progression = this.chordProgressions[this.mood];
    const currentChord = progression[bar % progression.length];
    const rootNote = currentChord[0];

    // -- Drum Pattern --
    // Kick on 1, and syncopated depending on mood
    if (stepInBar === 0 || (this.mood === 'Deep' && stepInBar === 10) || (this.mood === 'Ethereal' && stepInBar === 8)) {
      this.playKick(time);
    }
    // Snare on 2 and 4 (steps 4 and 12)
    if (stepInBar === 4 || stepInBar === 12) {
      this.playSnare(time);
    }
    // Hi-hat on 8th notes (steps 0, 2, 4, 6, 8, 10, 12, 14)
    if (stepInBar % 2 === 0) {
      const isOpen = stepInBar === 14; 
      this.playHihat(time, isOpen ? 'open' : 'closed');
    }

    // -- Chords --
    // Play on the 1st beat of every bar, and syncopated depending on mood
    if (stepInBar === 0 || (this.mood === 'Calm' && stepInBar === 10)) {
      const duration = this.mood === 'Ethereal' ? 3.0 : 1.2; // Ethereal has longer pads
      this.playChord(currentChord, time, duration);
    }

    // -- Bass --
    if (stepInBar === 0 || stepInBar === 6 || (this.mood === 'Deep' && stepInBar === 14)) {
      this.playBass(rootNote, time, 0.6);
    }

    // -- Arp / Melody Generator --
    // Play notes from the current chord occasionally for melody
    if (this.mood !== 'Calm' || Math.random() > 0.4) {
      // Don't play exactly on downbeats to leave room for chords
      if (stepInBar % 4 !== 0 && Math.random() > 0.7) {
        const randomNote = currentChord[Math.floor(Math.random() * currentChord.length)];
        this.playMelody(randomNote, time);
      }
    }
  }

  scheduler() {
    // Schedule ahead notes
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  start() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Start timing
    this.current16thNote = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.timerID);
  }
}

export const audioEngine = new AudioEngine();
