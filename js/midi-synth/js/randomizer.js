function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return min + Math.random() * (max - min);
}

function randBool(probability) {
  return Math.random() < probability;
}

function maybe(probability, value) {
  return randBool(probability) ? value : undefined;
}

function generateParametersRandomized() {
  var osc1Mix = randInt(0, 100);
  var osc2Mix = randInt(0, 100);
  if (osc1Mix === 0 && osc2Mix === 0) {
    if (Math.random() < 0.5) osc1Mix = randInt(40, 100);
    else osc2Mix = randInt(40, 100);
  }

  const attrs = {
    modWaveform: randInt(0, 3),
    modFrequency: randFloat(0, 10),
    modOsc1: maybe(0.4, randInt(0, 100)),
    modOsc2: maybe(0.4, randInt(0, 100)),
    modDouble: randBool(0.25),
    modQuadruple: randBool(0.15),
    osc1Waveform: randInt(0, 3),
    osc1Octave: randInt(0, 2),
    osc1Detune: randInt(-1200, 1200),
    osc1Mix: osc1Mix,
    osc2Waveform: randInt(0, 3),
    osc2Octave: randInt(0, 2),
    osc2Detune: randInt(-1200, 1200),
    osc2Mix: osc2Mix,
    // Stored as log2(Hz); UI range is 20Hz–20kHz
    filterCutoff: randFloat(Math.log2(20), Math.log2(20000)),
    filterQ: randFloat(0, 20),
    filterMod: maybe(0.4, randInt(0, 100)),
    filterEnv: randInt(0, 100),
    envA: maybe(0.5, randInt(0, 100)),
    envD: randInt(0, 100),
    envS: randInt(0, 100),
    envR: randInt(0, 100),
    filterEnvA: randInt(0, 100),
    filterEnvD: randInt(0, 100),
    filterEnvS: randInt(0, 100),
    filterEnvR: randInt(0, 100),
    drive: randInt(0, 100),
    reverb: randInt(0, 100),
    volume: randInt(40, 90),
    octave: randInt(0, 6),
  };
  const params = getDefaultParameters();
  Object.keys(attrs).forEach((key) => {
    if (attrs[key] !== undefined) {
      params[key] = attrs[key];
    }
  });
  return params;
}
