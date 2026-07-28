var curProg = 0;
var curOct = 0;
var curNote = 60;
var curMidi = 0;
var midiPort = [];
var currentPort = -1;

function Init() {
  synth = document.getElementById("tinysynth");
  kb = document.getElementById("kb");
  kb.addEventListener("change", KeyIn);

  synth.ready().then(() => {
    for (var i = 0; i < 128; ++i) {
      var o = document.createElement("option");
      o.innerHTML = i + 1 + " : " + synth.getTimbreName(0, i);
      document.getElementById("prog").appendChild(o);
    }
    ProgChange(0);
  });
}

function MidiIn(e) {
  if (synth) {
    switch (e.data[0] & 0xf0) {
      case 0x90:
        kb.setNote(e.data[2] ? 1 : 0, e.data[1]);
        break;
      case 0x80:
        kb.setNote(0, e.data[1]);
    }
    e.data[1] = e.data[1] + curOct * 12;
    synth.send(e.data, 0);
  }
}

function Ctrl() {
  if (typeof synth != "undefined") {
    synth.masterVol = document.getElementById("vol").value;
    synth.reverbLev = document.getElementById("rev").value;
  }
}

function KeyIn(e) {
  curNote = e.note[1] + curOct * 12;
  if (e.note[0]) synth.send([0x90 + curMidi, curNote, 100]);
  else synth.send([0x80 + curMidi, curNote, 0]);
}

function ProgChange(p) {
  if (synth) {
    synth.send([0xc0, p]);
  }
}

function SetQuality(n) {
  synth.quality = n;
}

window.onload = () => {
  Init();
};
