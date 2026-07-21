/* eslint require-jsdoc: "off" */

import { clone, freeze, INSTRUMENTS } from "./shiny-drum-machine-data.js";

const unitInterface = window.queryUnitInterface?.("wafer-v01");
const context = unitInterface?.audioContext ?? new AudioContext();
const audioDestination = unitInterface?.audioOutputNode ?? context.destination;

const LOOP_LENGTH = 16;
const BEATS_PER_FULL_NOTE = 4;
const VOLUMES = freeze([0, 0.3, 1]);

async function fetchAndDecodeAudio(url) {
  const response = await fetch(url);
  const responseBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(responseBuffer);
}

class Kit {
  constructor(id, prettyName, index) {
    this.id = id;
    this.prettyName = prettyName;
    this.index = index;
    this.buffer = {};
  }

  getSampleUrl(instrumentName) {
    return `./sound/drum-samples/${this.id}/${instrumentName.toLowerCase()}.m4a`;
  }

  load() {
    const instrumentPromises = INSTRUMENTS.map((instrument) =>
      this.loadSample(instrument.name),
    );
    const promise = Promise.all(instrumentPromises).then(() => null);
    // Return original Promise on subsequent load calls to avoid duplicate
    // loads.
    this.load = () => promise;
    return promise;
  }

  async loadSample(instrumentName) {
    this.buffer[instrumentName] = await fetchAndDecodeAudio(
      this.getSampleUrl(instrumentName),
    );
  }
}

class Effect {
  constructor(data, index) {
    this.name = data.name;
    this.url = data.url;
    this.dryMix = data.dryMix;
    this.wetMix = data.wetMix;
    this.index = index;
    this.buffer = undefined;
  }

  async load() {
    // Return if buffer has been loaded already or there is nothing to load
    // ("No effect" instance).
    if (!this.url || this.buffer) {
      return;
    }

    this.buffer = await fetchAndDecodeAudio(`./sound/${this.url}`);
  }
}

class Beat {
  constructor(data, kits, effects) {
    this.kits = kits;
    this.effects = effects;
    this.loadObject(data);
  }

  loadObject(data) {
    this._data = Object.seal(clone(data));
    this._kit = this.kits[data.kitIndex];
    this._effect = this.effects[data.effectIndex];
  }

  toObject() {
    return clone(this._data);
  }

  set kit(kit) {
    this._kit = kit;
    this._data.kitIndex = kit.index;
  }

  get kit() {
    return this._kit;
  }

  set effect(effect) {
    this._effect = effect;
    this._data.effectIndex = effect.index;

    // If the user chooses a new effect from the dropdown after having turned
    // the dry/wet effect slider to 0, reset the effect wetness to 0.5 to make
    // sure that the user hears the new effect.
    if (this._data.effectMix == 0) {
      this._data.effectMix = 0.5;
    }

    // If the effect is meant to be entirely wet (no unprocessed signal) then
    // put the effect level all the way up.
    if (effect.dryMix == 0) {
      this._data.effectMix = 1;
    }
  }

  get effect() {
    return this._effect;
  }

  set effectMix(effectMix) {
    this._data.effectMix = effectMix;
  }

  get effectMix() {
    return this._data.effectMix;
  }

  setPitch(instrumentName, pitch) {
    this._data[`${instrumentName.toLowerCase()}PitchVal`] = pitch;
  }

  getPitch(instrumentName) {
    return this._data[`${instrumentName.toLowerCase()}PitchVal`];
  }

  getPlaybackRate(instrumentName) {
    const pitch = this.getPitch(instrumentName);
    return Math.pow(2.0, 2.0 * (pitch - 0.5));
  }

  set swingFactor(swingFactor) {
    this._data.swingFactor = swingFactor;
  }

  get swingFactor() {
    return this._data.swingFactor;
  }

  set tempo(tempo) {
    this._data.tempo = tempo;
  }

  get tempo() {
    return this._data.tempo;
  }

  getNotes(instrumentName) {
    const index = 1 + INSTRUMENTS.findIndex((i) => i.name === instrumentName);
    return this._data[`rhythm${index}`];
  }

  toggleNote(instrumentName, rhythmIndex) {
    const notes = this.getNotes(instrumentName);
    const note = (notes[rhythmIndex] + 1) % 3;
    notes[rhythmIndex] = note;
  }

  getNote(instrumentName, rhythmIndex) {
    const notes = this.getNotes(instrumentName);
    return notes[rhythmIndex];
  }
}

class SoundEngine {
  constructor(beat) {
    this.beat = beat;
    // Create a dynamics compressor to sweeten the overall mix.
    const compressor = new DynamicsCompressorNode(context);
    compressor.connect(audioDestination);

    // Create master volume and reduce overall volume to avoid clipping.
    this.masterGainNode = new GainNode(context, { gain: 0.7 });
    this.masterGainNode.connect(compressor);

    // Create effect volume controlled by effect sliders.
    this.effectLevelNode = new GainNode(context, { gain: 1.0 });
    this.effectLevelNode.connect(this.masterGainNode);

    // Create convolver for effect
    this.convolver = new ConvolverNode(context);
    this.convolver.connect(this.effectLevelNode);
  }

  playNoteAtTime(instrument, rhythmIndex, noteTime) {
    const note = this.beat.getNote(instrument.name, rhythmIndex);

    if (!note) {
      return;
    }

    // Create the note
    const voice = new AudioBufferSourceNode(context, {
      buffer: this.beat.kit.buffer[instrument.name],
      playbackRate: this.beat.getPlaybackRate(instrument.name),
    });

    let finalNode = voice;

    // Optionally, connect to a panner.
    if (instrument.pan) {
      // Pan according to sequence position.
      const panner = new PannerNode(context, {
        positionX: 0.5 * rhythmIndex - 4,
        positionY: 0,
        positionZ: -1,
      });
      finalNode.connect(panner);
      finalNode = panner;
    }

    // Connect to dry mix
    const dryGainNode = new GainNode(context, {
      gain: VOLUMES[note] * instrument.mainGain * this.beat.effect.dryMix,
    });
    finalNode.connect(dryGainNode);
    dryGainNode.connect(this.masterGainNode);

    // Connect to wet mix
    const wetGainNode = new GainNode(context, { gain: instrument.sendGain });
    finalNode.connect(wetGainNode);
    wetGainNode.connect(this.convolver);

    voice.start(noteTime);
  }

  handleStep(rhythmIndex, time) {
    for (const instrument of INSTRUMENTS) {
      this.playNoteAtTime(instrument, rhythmIndex, time);
    }
  }

  updateEffect() {
    this.convolver.buffer = this.beat.effect.buffer;

    // Factor in both the preset's effect level and the blending level
    // (effectWetMix) stored in the effect itself.
    this.effectLevelNode.gain.value =
      this.beat.effectMix * this.beat.effect.wetMix;
  }
}

function createClockDriver(beat, stepCallback) {
  let timerId = null;
  return {
    start() {
      let nextBeatAt = context.currentTime;
      let rhythmIndex = 0;

      const tick = () => {
        stepCallback(rhythmIndex, nextBeatAt);

        // Convert configured beats per minute to delay per tick.
        const secondsPerBeat = 60.0 / beat.tempo / BEATS_PER_FULL_NOTE;
        const swingDirection = rhythmIndex % 2 ? -1 : 1;
        const swing = (beat.swingFactor / 3) * swingDirection;

        nextBeatAt += (1 + swing) * secondsPerBeat;
        rhythmIndex = (rhythmIndex + 1) % LOOP_LENGTH;

        timerId = setTimeout(tick, (nextBeatAt - context.currentTime) * 1000);
      };

      tick();
    },
    stop() {
      clearTimeout(timerId);
    },
  };
}

class Player {
  constructor(beat, onNextBeat) {
    this.soundEngine = new SoundEngine(beat);
    this.clockDriver = createClockDriver(beat, this.onStep.bind(this));
    this.beat = beat;
    this.onNextBeat = onNextBeat;
  }

  onStep(rhythmIndex, time) {
    this.soundEngine.handleStep(rhythmIndex, time);
    this.onNextBeat(rhythmIndex);
  }

  updateEffect() {
    this.soundEngine.updateEffect();
  }

  play() {
    this.clockDriver.start();
  }

  stop() {
    this.clockDriver.stop();
  }

  playNote(instrument, rhythmIndex) {
    this.soundEngine.playNoteAtTime(
      instrument,
      rhythmIndex,
      context.currentTime,
    );
  }
}

export { Beat, Player, Effect, Kit, unitInterface };
