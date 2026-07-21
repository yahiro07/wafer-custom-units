# SYNTH MODULAR

A fully-featured modular web synthesizer built with pure Web Audio API — no dependencies, no frameworks.

**[Launch Synth Modular](https://brendanjameslynskey.github.io/Synth_Modular/)**

## Features

### Synthesis Engine
- **Dual Oscillators** — Saw, Square, Sine, Triangle waveforms with independent octave control
- **Oscillator 2 Detune & Mix** — Fine detune control for rich, detuned sounds
- **Noise Generator** — White noise source with level control
- **Multi-mode Filter** — Lowpass, Highpass, Bandpass, Notch with cutoff, resonance, and envelope amount
- **ADSR Envelope** — Full Attack, Decay, Sustain, Release control with visual display
- **LFO** — Sine, Square, Saw, Triangle shapes targeting Filter, Pitch, or Amplitude

### Effects
- **Delay** — Time, Feedback, and Mix with filtered feedback path
- **Reverb** — Procedurally generated convolution reverb with decay control
- **Distortion** — Waveshaper distortion with drive control
- **Chorus** — Rate, Depth, and Mix for stereo widening

### Sequencer
- **16-step sequencer** with per-step note and velocity control
- **9 built-in sequence presets** — Acid Line, Techno Pulse, Arpeggio, Trance Gate, and more
- **Randomize** function with selectable scales (Major, Minor, Pentatonic, Blues, Dorian, Phrygian, Lydian, Arabic, and more)
- **Adjustable BPM** (30-300)

### Presets
20 built-in synth presets including:
- Fat Bass, Acid Squelch, Classic Lead, Warm Pad
- Brass Stab, Pluck, PWM Strings, Sync Lead
- Organ, Sci-Fi FX, Wobble Bass, Ethereal Keys
- Hoover, Sub Bass, Reese Bass, Blade Runner
- Chip Lead, Ambient Drone, and more
- Save your own presets to local storage

### Interface
- **Desktop version** — Full module layout with computer keyboard support (keys A-L play notes)
- **Mobile version** — Touch-optimized tabbed interface with swipeable keyboard
- **Real-time visualizer** — Frequency spectrum and waveform display with audio-reactive particles
- **Retro aesthetic** — Scanlines, LED indicators, analog-inspired panel design

## Tech Stack

- Pure vanilla JavaScript
- Web Audio API
- HTML5 Canvas for visualization
- Zero external dependencies
- Works in all modern browsers

## Development

No build step required. Just open `index.html` in a browser or serve with any static file server:

```bash
python3 -m http.server 8000
```

## Structure

```
├── index.html        Landing page (desktop/mobile selection)
├── desktop.html      Desktop synthesizer interface
├── mobile.html       Mobile-optimized interface
├── synth-engine.js   Core Web Audio synthesis engine + sequencer
├── presets.js        Synth & sequencer preset definitions
├── style.css         Shared desktop styles
└── README.md
```

## License

MIT
