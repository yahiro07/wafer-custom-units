const unitInterface = window.queryUnitInterface?.("wafer-v01");

var voices = new Array();
var audioContext = null;
var isMobile = false; // we have to disable the convolver on mobile for performance reasons.

// This is the "initial patch"
var currentModWaveform = 0; // SINE
var currentModFrequency = 2.1; // Hz * 10 = 2.1
var currentModOsc1 = 15;
var currentModOsc2 = 17;

var currentOsc1Waveform = 2; // SAW
var currentOsc1Octave = 0; // 32'
var currentOsc1Detune = 0; // 0
var currentOsc1Mix = 50.0; // 50%

var currentOsc2Waveform = 2; // SAW
var currentOsc2Octave = 0; // 16'
var currentOsc2Detune = -25; // fat detune makes pretty analogue-y sound.  :)
var currentOsc2Mix = 50.0; // 0%

var currentFilterCutoff = 8;
var currentFilterQ = 7.0;
var currentFilterMod = 21;
var currentFilterEnv = 56;

var currentEnvA = 2;
var currentEnvD = 15;
var currentEnvS = 68;
var currentEnvR = 5;

var currentFilterEnvA = 5;
var currentFilterEnvD = 6;
var currentFilterEnvS = 5;
var currentFilterEnvR = 7;

var currentDrive = 38;
var currentRev = 32;
var currentVol = 75;
// end initial patch

var keys = new Array(256);
/* old mapping
keys[65] = 60; // = C4 ("middle C")
keys[87] = 61;
keys[83] = 62;
keys[69] = 63;
keys[68] = 64;
keys[70] = 65; // = F4
keys[84] = 66;
keys[71] = 67;
keys[89] = 68;
keys[72] = 69;
keys[85] = 70;
keys[74] = 71;
keys[75] = 72; // = C5
keys[79] = 73;
keys[76] = 74;
keys[80] = 75;
keys[186] = 76;
keys[222] = 77; // = F5
keys[221] = 78;
keys[13] = 79;
keys[220] = 80;
*/

//Lower row: zsxdcvgbhnjm...
keys[16] = 41; // = F2
keys[65] = 42;
keys[90] = 43;
keys[83] = 44;
keys[88] = 45;
keys[68] = 46;
keys[67] = 47;
keys[86] = 48; // = C3
keys[71] = 49;
keys[66] = 50;
keys[72] = 51;
keys[78] = 52;
keys[77] = 53; // = F3
keys[75] = 54;
keys[188] = 55;
keys[76] = 56;
keys[190] = 57;
keys[186] = 58;
keys[191] = 59;

// Upper row: q2w3er5t6y7u...
keys[81] = 60; // = C4 ("middle C")
keys[50] = 61;
keys[87] = 62;
keys[51] = 63;
keys[69] = 64;
keys[82] = 65; // = F4
keys[53] = 66;
keys[84] = 67;
keys[54] = 68;
keys[89] = 69;
keys[55] = 70;
keys[85] = 71;
keys[73] = 72; // = C5
keys[57] = 73;
keys[79] = 74;
keys[48] = 75;
keys[80] = 76;
keys[219] = 77; // = F5
keys[187] = 78;
keys[221] = 79;
keys[220] = 80;

var effectChain = null;
var waveshaper = null;
var volNode = null;
var revNode = null;
var revGain = null;
var revBypassGain = null;
var compressor = null;

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function noteOn(note, time, velocity = 0.75) {
  if (voices[note] != null) {
    voices[note].noteOff(time);
    voices[note] = null;
  }
  voices[note] = new Voice(note, time, velocity);
  //Ensure that the highlight on pressed key is added, regardless of selected octave
  var e = document.getElementById("k" + (note + 12 * (currentOctave - 3)));

  if (e) e.classList.add("pressed");
}

function noteOff(note, time) {
  if (voices[note] != null) {
    // Shut off the note playing and clear it
    voices[note].noteOff(time);
    voices[note] = null;
    //Ensure that the highlight on pressed key is removed, regardless of selected octave
    var e = document.getElementById("k" + (note + 12 * (currentOctave - 3)));

    if (e) e.classList.remove("pressed");
  }
}

function $(id) {
  return document.getElementById(id);
}

function controlValue(input) {
  if (typeof input === "number") return input;
  if (typeof input === "string") return parseFloat(input);
  if (!input || typeof input !== "object") return input;

  if (input.currentTarget && input.currentTarget.value !== undefined) {
    return parseFloat(input.currentTarget.value);
  }
  if (input.target && input.target.value !== undefined) {
    return parseFloat(input.target.value);
  }
  if (input.value !== undefined) {
    return parseFloat(input.value);
  }
  return input;
}

// 'value' is normalized to 0..1.
function controller(number, value) {
  switch (number) {
    case 2:
      $("fFreq").setRatioValue(value);
      onUpdateFilterCutoff(100 * value);
      return;
    case 0x0a:
    case 7:
      $("fQ").setValue(20 * value);
      onUpdateFilterQ(20 * value);
      return;
    case 1:
      $("fMod").setValue(100 * value);
      onUpdateFilterMod(100 * value);
      return;
    case 0x49:
    case 5:
    case 15:
      $("drive").setValue(100 * value);
      onUpdateDrive(100 * value);
      return;
    case 0x48:
    case 6:
    case 16:
      $("reverb").setValue(100 * value);
      onUpdateReverb(100 * value);
      return;
    case 0x4a:
      $("modOsc1").setValue(100 * value);
      onUpdateModOsc1(100 * value);
      return;
    case 0x47:
      $("modOsc2").setValue(100 * value);
      onUpdateModOsc2(100 * value);
      return;
    case 4:
    case 17:
      $("mFreq").setValue(10 * value);
      onUpdateModFrequency(10 * value);
      return;
    case 0x5b:
      $("volume").setValue(100 * value);
      onUpdateVolume(100 * value);
      return;
    case 33: // "x1" button
    case 51:
      moDouble = value > 0;
      changeModMultiplier();
      return;
    case 34: // "x2" button
    case 52:
      moQuadruple = value > 0;
      changeModMultiplier();
      return;
  }
}

var currentPitchWheel = 0.0;
// 'value' is normalized to [-1,1]
function pitchWheel(value) {
  var i;

  currentPitchWheel = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i]) {
      if (voices[i].osc1)
        voices[i].osc1.detune.value =
          currentOsc1Detune + currentPitchWheel * 500; // value in cents - detune major fifth.
      if (voices[i].osc2)
        voices[i].osc2.detune.value =
          currentOsc2Detune + currentPitchWheel * 500; // value in cents - detune major fifth.
    }
  }
}

function polyPressure(noteNumber, value) {
  if (voices[noteNumber] != null) {
    voices[noteNumber].setFilterQ(value * 20);
  }
}

var waveforms = ["sine", "square", "sawtooth", "triangle"];

function onUpdateModWaveform(ev) {
  currentModWaveform = ev.target.selectedIndex;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].setModWaveform(waveforms[currentModWaveform]);
    }
  }
}

function onUpdateModFrequency(ev) {
  var value = controlValue(ev);
  currentModFrequency = value;
  var oscFreq = currentModFrequency * modOscFreqMultiplier;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateModFrequency(oscFreq);
    }
  }
}

function onUpdateModOsc1(ev) {
  var value = controlValue(ev);
  currentModOsc1 = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateModOsc1(currentModOsc1);
    }
  }
}

function onUpdateModOsc2(ev) {
  var value = controlValue(ev);
  currentModOsc2 = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateModOsc2(currentModOsc2);
    }
  }
}

function onUpdateFilterCutoff(ev) {
  var value = controlValue(ev);
  //	console.log( "currentFilterCutoff= " + currentFilterCutoff + "new cutoff= " + value );
  currentFilterCutoff = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].setFilterCutoff(value);
    }
  }
}

function onUpdateFilterQ(ev) {
  var value = controlValue(ev);
  currentFilterQ = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].setFilterQ(value);
    }
  }
}

function onUpdateFilterMod(ev) {
  var value = controlValue(ev);
  currentFilterMod = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].setFilterMod(value);
    }
  }
}

function onUpdateFilterEnv(ev) {
  currentFilterEnv = controlValue(ev);
}

function onUpdateOsc1Wave(ev) {
  currentOsc1Waveform = ev.target.selectedIndex;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].setOsc1Waveform(waveforms[currentOsc1Waveform]);
    }
  }
}

function onUpdateOsc1Octave(ev) {
  currentOsc1Octave = ev.target.selectedIndex;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateOsc1Frequency();
    }
  }
}

function onUpdateOsc1Detune(ev) {
  var value = controlValue(ev);
  currentOsc1Detune = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateOsc1Frequency();
    }
  }
}

function onUpdateOsc1Mix(value) {
  value = controlValue(value);
  currentOsc1Mix = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateOsc1Mix(value);
    }
  }
}

function onUpdateOsc2Wave(ev) {
  currentOsc2Waveform = ev.target.selectedIndex;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].setOsc2Waveform(waveforms[currentOsc2Waveform]);
    }
  }
}

function onUpdateOsc2Octave(ev) {
  currentOsc2Octave = ev.target.selectedIndex;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateOsc2Frequency();
    }
  }
}

function onUpdateOsc2Detune(ev) {
  var value = controlValue(ev);
  currentOsc2Detune = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateOsc2Frequency();
    }
  }
}

function onUpdateOsc2Mix(ev) {
  var value = controlValue(ev);
  currentOsc2Mix = value;
  for (var i = 0; i < 255; i++) {
    if (voices[i] != null) {
      voices[i].updateOsc2Mix(value);
    }
  }
}

function onUpdateEnvA(ev) {
  currentEnvA = controlValue(ev);
}

function onUpdateEnvD(ev) {
  currentEnvD = controlValue(ev);
}

function onUpdateEnvS(ev) {
  currentEnvS = controlValue(ev);
}

function onUpdateEnvR(ev) {
  currentEnvR = controlValue(ev);
}

function onUpdateFilterEnvA(ev) {
  currentFilterEnvA = controlValue(ev);
}

function onUpdateFilterEnvD(ev) {
  currentFilterEnvD = controlValue(ev);
}

function onUpdateFilterEnvS(ev) {
  currentFilterEnvS = controlValue(ev);
}

function onUpdateFilterEnvR(ev) {
  currentFilterEnvR = controlValue(ev);
}

function onUpdateDrive(value) {
  currentDrive = controlValue(value);
  waveshaper.setDrive(0.01 + (currentDrive * currentDrive) / 500.0);
}

function onUpdateVolume(ev) {
  currentVol = controlValue(ev);
  volNode.gain.value = currentVol / 100;
}

function onUpdateReverb(ev) {
  currentRev = controlValue(ev);
  var value = currentRev / 100;

  // equal-power crossfade
  var gain1 = Math.cos(value * 0.5 * Math.PI);
  var gain2 = Math.cos((1.0 - value) * 0.5 * Math.PI);

  revBypassGain.gain.value = gain1;
  revGain.gain.value = gain2;
}

/*
var FOURIER_SIZE = 2048;
var wave = false;

	if ( wave ) {
		var real = new Float32Array(FOURIER_SIZE);
		var imag = new Float32Array(FOURIER_SIZE);
		real[0] = 0.0;
		imag[0] = 0.0;

		for (var i=1; i<FOURIER_SIZE; i++) {
			real[i]=1.0;
			imag[i]=1.0;
		}

		var wavetable = audioContext.createWaveTable(real, imag);
		oscillatorNode.setWaveTable(wavetable);
	} else {

*/

function filterFrequencyFromCutoff(pitch, cutoff) {
  var nyquist = 0.5 * audioContext.sampleRate;

  //    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
  var filterFrequency = Math.pow(2, 9 * cutoff - 1) * pitch;
  if (filterFrequency > nyquist) filterFrequency = nyquist;
  return filterFrequency;
}

function Voice(note, time, velocity) {
  this.originalFrequency = frequencyFromNoteNumber(note);

  // create osc 1
  this.osc1 = audioContext.createOscillator();
  this.updateOsc1Frequency();
  this.osc1.type = waveforms[currentOsc1Waveform];

  this.osc1Gain = audioContext.createGain();
  this.osc1Gain.gain.value = 0.005 * currentOsc1Mix;
  //	this.osc1Gain.gain.value = 0.05 + (0.33 * velocity);
  this.osc1.connect(this.osc1Gain);

  // create osc 2
  this.osc2 = audioContext.createOscillator();
  this.updateOsc2Frequency();
  this.osc2.type = waveforms[currentOsc2Waveform];

  this.osc2Gain = audioContext.createGain();
  this.osc2Gain.gain.value = 0.005 * currentOsc2Mix;
  //	this.osc2Gain.gain.value = 0.05 + (0.33 * velocity);
  this.osc2.connect(this.osc2Gain);

  // create modulator osc
  this.modOsc = audioContext.createOscillator();
  this.modOsc.type = waveforms[currentModWaveform];
  this.modOsc.frequency.value = currentModFrequency * modOscFreqMultiplier;

  this.modOsc1Gain = audioContext.createGain();
  this.modOsc.connect(this.modOsc1Gain);
  this.modOsc1Gain.gain.value = currentModOsc1 / 10;
  this.modOsc1Gain.connect(this.osc1.frequency); // vibrato

  this.modOsc2Gain = audioContext.createGain();
  this.modOsc.connect(this.modOsc2Gain);
  this.modOsc2Gain.gain.value = currentModOsc2 / 10;
  this.modOsc2Gain.connect(this.osc2.frequency); // vibrato

  // create the LP filter
  this.filter1 = audioContext.createBiquadFilter();
  this.filter1.type = "lowpass";
  this.filter1.Q.value = currentFilterQ;
  this.filter1.frequency.value = Math.pow(2, currentFilterCutoff);
  // filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff );
  //	console.log( "filter frequency: " + this.filter1.frequency.value);
  this.filter2 = audioContext.createBiquadFilter();
  this.filter2.type = "lowpass";
  this.filter2.Q.value = currentFilterQ;
  this.filter2.frequency.value = Math.pow(2, currentFilterCutoff);

  this.osc1Gain.connect(this.filter1);
  this.osc2Gain.connect(this.filter1);
  this.filter1.connect(this.filter2);

  // connect the modulator to the filters
  this.modFilterGain = audioContext.createGain();
  this.modOsc.connect(this.modFilterGain);
  this.modFilterGain.gain.value = currentFilterMod * 24;
  //	console.log("modFilterGain=" + currentFilterMod*24);
  this.modFilterGain.connect(this.filter1.detune); // filter vibrato
  this.modFilterGain.connect(this.filter2.detune); // filter vibrato

  // create the volume envelope
  this.envelope = audioContext.createGain();
  this.filter2.connect(this.envelope);
  this.envelope.connect(effectChain);

  // set up the volume and filter envelopes
  var now = time ?? audioContext.currentTime;
  this.startTime = now;
  this.envAttackDur = currentEnvA / 20.0;
  this.envDecayTc = currentEnvD / 100.0 + 0.001;
  this.envSustain = currentEnvS / 100.0;

  this.envelope.gain.value = 0.0;
  this.scheduleAmpEnvelope();

  // Range: 0-7200: 6-octave range
  this.filterAttackLevel = currentFilterEnv * 72;
  this.filterSustainLevel =
    (this.filterAttackLevel * currentFilterEnvS) / 100.0;
  this.filterAttackDur = currentFilterEnvA / 20.0;
  // tweak to get target decay to work properly
  if (!this.filterAttackDur) this.filterAttackDur = 0.05;
  this.filterDecayTc = Math.max(currentFilterEnvD / 100.0, 0.001);

  this.scheduleFilterEnvelope();

  this.osc1.start(now);
  this.osc2.start(now);
  this.modOsc.start(now);
}

Voice.prototype.ampValueAt = function (t) {
  var dt = t - this.startTime;
  if (dt <= 0) return 0;
  if (this.envAttackDur <= 0) {
    return (
      this.envSustain + (1 - this.envSustain) * Math.exp(-dt / this.envDecayTc)
    );
  }
  if (dt < this.envAttackDur) return dt / this.envAttackDur;
  var decayDt = dt - this.envAttackDur;
  return (
    this.envSustain +
    (1 - this.envSustain) * Math.exp(-decayDt / this.envDecayTc)
  );
};

Voice.prototype.filterValueAt = function (t) {
  var dt = t - this.startTime;
  if (dt <= 0) return 0;
  if (dt < this.filterAttackDur) {
    return (this.filterAttackLevel * dt) / this.filterAttackDur;
  }
  var decayDt = dt - this.filterAttackDur;
  return (
    this.filterSustainLevel +
    (this.filterAttackLevel - this.filterSustainLevel) *
      Math.exp(-decayDt / this.filterDecayTc)
  );
};

Voice.prototype.scheduleAmpEnvelope = function () {
  var g = this.envelope.gain;
  var t0 = this.startTime;
  var attackEnd = t0 + this.envAttackDur;

  g.setValueAtTime(0.0, t0);
  if (this.envAttackDur <= 0) {
    g.setValueAtTime(1.0, t0);
    g.setTargetAtTime(this.envSustain, t0, this.envDecayTc);
  } else {
    g.linearRampToValueAtTime(1.0, attackEnd);
    g.setTargetAtTime(this.envSustain, attackEnd, this.envDecayTc);
  }
};

Voice.prototype.scheduleFilterEnvelope = function () {
  var t0 = this.startTime;
  var attackEnd = t0 + this.filterAttackDur;

  this.filter1.detune.setValueAtTime(0, t0);
  this.filter2.detune.setValueAtTime(0, t0);
  this.filter1.detune.linearRampToValueAtTime(
    this.filterAttackLevel,
    attackEnd,
  );
  this.filter2.detune.linearRampToValueAtTime(
    this.filterAttackLevel,
    attackEnd,
  );
  this.filter1.detune.setTargetAtTime(
    this.filterSustainLevel,
    attackEnd,
    this.filterDecayTc,
  );
  this.filter2.detune.setTargetAtTime(
    this.filterSustainLevel,
    attackEnd,
    this.filterDecayTc,
  );
};

// Rebuild ADS up to offTime then release. Used when noteOff is scheduled
// ahead of time so cancelScheduledValues cannot clobber a not-yet-played ramp.
Voice.prototype.rebuildAmpEnvelopeWithRelease = function (offTime, releaseTc) {
  var g = this.envelope.gain;
  var t0 = this.startTime;
  var attackEnd = t0 + this.envAttackDur;
  var v = this.ampValueAt(offTime);

  g.cancelScheduledValues(t0);
  g.setValueAtTime(0.0, t0);

  if (offTime <= t0) {
    g.setValueAtTime(0.0, offTime);
  } else if (this.envAttackDur <= 0) {
    g.setValueAtTime(1.0, t0);
    g.setTargetAtTime(this.envSustain, t0, this.envDecayTc);
  } else if (offTime <= attackEnd) {
    g.linearRampToValueAtTime(v, offTime);
  } else {
    g.linearRampToValueAtTime(1.0, attackEnd);
    g.setTargetAtTime(this.envSustain, attackEnd, this.envDecayTc);
  }

  g.setTargetAtTime(0.0, offTime, releaseTc);
};

Voice.prototype.rebuildFilterEnvelopeWithRelease = function (
  offTime,
  releaseTc,
) {
  var t0 = this.startTime;
  var attackEnd = t0 + this.filterAttackDur;
  var v = this.filterValueAt(offTime);

  this.filter1.detune.cancelScheduledValues(t0);
  this.filter2.detune.cancelScheduledValues(t0);
  this.filter1.detune.setValueAtTime(0, t0);
  this.filter2.detune.setValueAtTime(0, t0);

  if (offTime <= t0) {
    this.filter1.detune.setValueAtTime(0, offTime);
    this.filter2.detune.setValueAtTime(0, offTime);
  } else if (offTime <= attackEnd) {
    this.filter1.detune.linearRampToValueAtTime(v, offTime);
    this.filter2.detune.linearRampToValueAtTime(v, offTime);
  } else {
    this.filter1.detune.linearRampToValueAtTime(
      this.filterAttackLevel,
      attackEnd,
    );
    this.filter2.detune.linearRampToValueAtTime(
      this.filterAttackLevel,
      attackEnd,
    );
    this.filter1.detune.setTargetAtTime(
      this.filterSustainLevel,
      attackEnd,
      this.filterDecayTc,
    );
    this.filter2.detune.setTargetAtTime(
      this.filterSustainLevel,
      attackEnd,
      this.filterDecayTc,
    );
  }

  this.filter1.detune.setTargetAtTime(0, offTime, releaseTc);
  this.filter2.detune.setTargetAtTime(0, offTime, releaseTc);
};

Voice.prototype.setModWaveform = function (value) {
  this.modOsc.type = value;
};

Voice.prototype.updateModFrequency = function (value) {
  this.modOsc.frequency.value = value;
};

Voice.prototype.updateModOsc1 = function (value) {
  this.modOsc1Gain.gain.value = value / 10;
};

Voice.prototype.updateModOsc2 = function (value) {
  this.modOsc2Gain.gain.value = value / 10;
};

Voice.prototype.setOsc1Waveform = function (value) {
  this.osc1.type = value;
};

Voice.prototype.updateOsc1Frequency = function (value) {
  this.osc1.frequency.value =
    this.originalFrequency * Math.pow(2, currentOsc1Octave - 2); // -2 because osc1 is 32', 16', 8'
  this.osc1.detune.value = currentOsc1Detune + currentPitchWheel * 500; // value in cents - detune major fifth.
};

Voice.prototype.updateOsc1Mix = function (value) {
  this.osc1Gain.gain.value = 0.005 * value;
};

Voice.prototype.setOsc2Waveform = function (value) {
  this.osc2.type = value;
};

Voice.prototype.updateOsc2Frequency = function (value) {
  this.osc2.frequency.value =
    this.originalFrequency * Math.pow(2, currentOsc2Octave - 1);
  this.osc2.detune.value = currentOsc2Detune + currentPitchWheel * 500; // value in cents - detune major fifth.
};

Voice.prototype.updateOsc2Mix = function (value) {
  this.osc2Gain.gain.value = 0.005 * value;
};

Voice.prototype.setFilterCutoff = function (value) {
  var now = audioContext.currentTime;
  var filterFrequency = Math.pow(2, value);
  //	console.log("Filter cutoff: orig:" + this.filter1.frequency.value + " new:" + filterFrequency + " value: " + value );
  this.filter1.frequency.value = filterFrequency;
  this.filter2.frequency.value = filterFrequency;
};

Voice.prototype.setFilterQ = function (value) {
  this.filter1.Q.value = value;
  this.filter2.Q.value = value;
};

Voice.prototype.setFilterMod = function (value) {
  this.modFilterGain.gain.value = currentFilterMod * 24;
  //	console.log( "filterMod.gain=" + currentFilterMod*24);
};

Voice.prototype.noteOff = function (time) {
  var offTime = time ?? audioContext.currentTime;
  var ctxNow = audioContext.currentTime;
  var releaseTc = Math.max(currentEnvR / 100, 0.001);
  var filterReleaseTc = Math.max(currentFilterEnvR / 100.0, 0.001);
  var stopAt = offTime + Math.max(currentEnvR / 10.0, releaseTc * 5);

  // Ahead-of-time noteOff (sequencer lookahead): rebuild the envelope so
  // cancelScheduledValues cannot wipe a not-yet-played attack ramp.
  // Live noteOff: pin the mathematically computed value, then release.
  if (this.startTime >= ctxNow - 0.001 && offTime > ctxNow + 0.005) {
    this.rebuildAmpEnvelopeWithRelease(offTime, releaseTc);
    this.rebuildFilterEnvelopeWithRelease(offTime, filterReleaseTc);
  } else {
    var t = Math.max(offTime, ctxNow);
    var amp = this.ampValueAt(t);
    var filt = this.filterValueAt(t);

    this.envelope.gain.cancelScheduledValues(t);
    this.envelope.gain.setValueAtTime(amp, t);
    this.envelope.gain.setTargetAtTime(0.0, t, releaseTc);

    this.filter1.detune.cancelScheduledValues(t);
    this.filter2.detune.cancelScheduledValues(t);
    this.filter1.detune.setValueAtTime(filt, t);
    this.filter2.detune.setValueAtTime(filt, t);
    this.filter1.detune.setTargetAtTime(0, t, filterReleaseTc);
    this.filter2.detune.setTargetAtTime(0, t, filterReleaseTc);
  }

  this.osc1.stop(stopAt);
  this.osc2.stop(stopAt);
};

var currentOctave = 3;
var modOscFreqMultiplier = 1;
var moDouble = false;
var moQuadruple = false;

function changeModMultiplier() {
  modOscFreqMultiplier = (moDouble ? 2 : 1) * (moQuadruple ? 4 : 1);
  onUpdateModFrequency(currentModFrequency);
}

function keyDown(ev) {
  if (ev.keyCode == 49 || ev.keyCode == 50) {
    if (ev.keyCode == 49) moDouble = true;
    else if (ev.keyCode == 50) moQuadruple = true;
    changeModMultiplier();
  }

  var note = keys[ev.keyCode];
  if (note) noteOn(note + 12 * (3 - currentOctave));
  console.log("key down: " + ev.keyCode);

  return false;
}

function keyUp(ev) {
  if (ev.keyCode == 49 || ev.keyCode == 50) {
    if (ev.keyCode == 49) moDouble = false;
    else if (ev.keyCode == 50) moQuadruple = false;
    changeModMultiplier();
  }

  var note = keys[ev.keyCode];
  if (note) noteOff(note + 12 * (3 - currentOctave));
  //	console.log( "key up: " + ev.keyCode );

  return false;
}
var pointers = [];

function touchstart(ev) {
  for (var i = 0; i < ev.targetTouches.length; i++) {
    var touch = ev.targetTouches[0];
    var element = touch.target;

    var note = parseInt(element.id.substring(1));
    console.log(
      "touchstart: id: " +
        element.id +
        "identifier: " +
        touch.identifier +
        " note:" +
        note,
    );
    if (!isNaN(note)) {
      noteOn(note + 12 * (3 - currentOctave));
      var keybox = document.getElementById("keybox");
      pointers[touch.identifier] = note;
    }
  }
  ev.preventDefault();
}

function touchmove(ev) {
  for (var i = 0; i < ev.targetTouches.length; i++) {
    var touch = ev.targetTouches[0];
    var element = touch.target;

    var note = parseInt(element.id.substring(1));
    console.log(
      "touchmove: id: " +
        element.id +
        "identifier: " +
        touch.identifier +
        " note:" +
        note,
    );
    if (
      !isNaN(note) &&
      pointers[touch.identifier] &&
      pointers[touch.identifier] != note
    ) {
      noteOff(pointers[touch.identifier] + 12 * (3 - currentOctave));
      noteOn(note + 12 * (3 - currentOctave));
      var keybox = document.getElementById("keybox");
      pointers[touch.identifier] = note;
    }
  }
  ev.preventDefault();
}

function touchend(ev) {
  var note = parseInt(ev.target.id.substring(1));
  console.log("touchend: id: " + ev.target.id + " note:" + note);
  if (note != NaN) noteOff(note + 12 * (3 - currentOctave));
  pointers[ev.pointerId] = null;
  var keybox = document.getElementById("keybox");
  ev.preventDefault();
}

function touchcancel(ev) {
  console.log("touchcancel");
  ev.preventDefault();
}

function pointerDown(ev) {
  var note = parseInt(ev.target.id.substring(1));
  if (pointerDebugging)
    console.log(
      "pointer down: id: " +
        ev.pointerId +
        " target: " +
        ev.target.id +
        " note:" +
        note,
    );
  if (!isNaN(note)) {
    noteOn(note + 12 * (3 - currentOctave));
    var keybox = document.getElementById("keybox");
    pointers[ev.pointerId] = note;
  }
  ev.preventDefault();
}

function pointerMove(ev) {
  var note = parseInt(ev.target.id.substring(1));
  if (pointerDebugging)
    console.log(
      "pointer move: id: " +
        ev.pointerId +
        " target: " +
        ev.target.id +
        " note:" +
        note,
    );
  if (
    !isNaN(note) &&
    pointers[ev.pointerId] &&
    pointers[ev.pointerId] != note
  ) {
    if (pointers[ev.pointerId])
      noteOff(pointers[ev.pointerId] + 12 * (3 - currentOctave));
    noteOn(note + 12 * (3 - currentOctave));
    pointers[ev.pointerId] = note;
  }
  ev.preventDefault();
}

function pointerUp(ev) {
  var note = parseInt(ev.target.id.substring(1));
  if (pointerDebugging)
    console.log("pointer up: id: " + ev.pointerId + " note:" + note);
  if (note != NaN) noteOff(note + 12 * (3 - currentOctave));
  pointers[ev.pointerId] = null;
  var keybox = document.getElementById("keybox");
  ev.preventDefault();
}

function onChangeOctave(ev) {
  currentOctave = ev.target.selectedIndex;
}

function initAudio() {
  audioContext = unitInterface?.audioContext ?? new AudioContext();
  const audioDestination =
    unitInterface?.audioOutputNode ?? audioContext.destination;

  window.addEventListener("keydown", keyDown, false);
  window.addEventListener("keyup", keyUp, false);
  setupSynthUI();

  isMobile =
    navigator.userAgent.indexOf("Android") != -1 ||
    navigator.userAgent.indexOf("iPad") != -1 ||
    navigator.userAgent.indexOf("iPhone") != -1;

  // set up the master effects chain for all voices to connect to.
  effectChain = audioContext.createGain();
  waveshaper = new WaveShaper(audioContext);
  effectChain.connect(waveshaper.input);
  onUpdateDrive(currentDrive);

  if (!isMobile) revNode = audioContext.createConvolver();
  else revNode = audioContext.createGain();
  revGain = audioContext.createGain();
  revBypassGain = audioContext.createGain();

  volNode = audioContext.createGain();
  volNode.gain.value = currentVol;
  compressor = audioContext.createDynamicsCompressor();
  waveshaper.output.connect(revNode);
  waveshaper.output.connect(revBypassGain);
  revNode.connect(revGain);
  revGain.connect(volNode);
  revBypassGain.connect(volNode);
  onUpdateReverb({ currentTarget: { value: currentRev } });

  volNode.connect(compressor);
  compressor.connect(audioDestination);
  onUpdateVolume({ currentTarget: { value: currentVol } });

  if (!isMobile) {
    var irRRequest = new XMLHttpRequest();
    irRRequest.open("GET", "sounds/irRoom.wav", true);
    irRRequest.responseType = "arraybuffer";
    irRRequest.onload = function () {
      audioContext.decodeAudioData(irRRequest.response, function (buffer) {
        if (revNode) revNode.buffer = buffer;
        else console.log("no revNode ready!");
      });
    };
    irRRequest.send();
  }
  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      viewSize: [940, 550],
    },
    noteInput: {
      noteOn(note, time, velocity) {
        noteOn(note, time, velocity);
      },
      noteOff(note, time) {
        noteOff(note, time);
      },
    },
    persistence: {
      emitState: emitPersistedState,
      applyState: applyPersistedState,
    },
  });
}

window.onload = initAudio;
