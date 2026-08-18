async function Init() {
  synth = document.getElementById("tinysynth");
  kb = document.getElementById("kb");
  kb.addEventListener("change", KeyIn);

  await synth.ready();

  for (let i = 0; i < 128; ++i) {
    const o = document.createElement("option");
    o.innerHTML = i + 1 + " : " + synth.getTimbreName(0, i);
    document.getElementById("prog").appendChild(o);
  }
  ProgChange(0);

  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      categoryHint: "synthesizer",
      viewSize: [570, 287],
    },
    noteInput: {
      noteOn(noteNumber, time, velocity) {
        synth.send([0x90, noteNumber, (velocity ?? 1) * 127], time);
      },
      noteOff(noteNumber, time) {
        synth.send([0x80, noteNumber, 0], time);
      },
    },
    persistence: {
      emitStateBytes() {
        const pg = document.getElementById("prog").selectedIndex;
        const master = document.getElementById("vol").value;
        const reverb = document.getElementById("rev").value;
        const quality = synth.quality;
        return new Uint8Array([
          pg,
          Math.round(master * 100),
          Math.round(reverb * 100),
          quality,
        ]);
      },
      applyStateBytes(stateBytes) {
        if (stateBytes.length !== 4) return;
        const pg = stateBytes[0];
        const master = stateBytes[1] / 100;
        const reverb = stateBytes[2] / 100;
        const quality = stateBytes[3];
        document.getElementById("prog").selectedIndex = pg;
        document.getElementById("vol").value = master;
        document.getElementById("rev").value = reverb;
        ProgChange(pg);
        Ctrl();
        SetQuality(quality);
      },
    },
    automationInput,
  });
}

function Ctrl() {
  if (typeof synth !== "undefined") {
    synth.masterVol = document.getElementById("vol").value;
    synth.reverbLev = document.getElementById("rev").value;
  }
}

function KeyIn(e) {
  const curOct = 0;
  const curNote = e.note[1] + curOct * 12;
  if (e.note[0]) synth.send([0x90, curNote, 100]);
  else synth.send([0x80, curNote, 0]);
}

function ProgChange(p) {
  synth.send([0xc0, p]);
}

function ProgShift(dir) {
  const sel = document.getElementById("prog");
  const n = sel.options.length;
  const next = (((sel.selectedIndex + dir) % n) + n) % n;
  sel.selectedIndex = next;
  ProgChange(next);
}

function ProgRandom() {
  const sel = document.getElementById("prog");
  const n = sel.options.length;
  const next = Math.floor(Math.random() * n);
  sel.selectedIndex = next;
  ProgChange(next);
}

function SetQuality(n) {
  synth.quality = n;
}

window.onload = () => {
  Init();
};
