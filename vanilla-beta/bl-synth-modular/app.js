// ============================================================
// DESKTOP APP CONTROLLER
// ============================================================

const synth = new SynthEngine();
const seq = new Sequencer(synth);
let vizAnimId = null;

// --- Init ---
async function initApp() {
  await synth.init();
  buildKeyboard();
  buildSequencer();
  populatePresets();
  bindControls();
  startVisualization();
  drawEnvelope();

  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "instrument",
      viewSize: [1060, 630],
    },
    noteInput: {
      noteOn(noteNumber) {
        synth.noteOn(noteNumber);
      },
      noteOff(noteNumber) {
        synth.noteOff(noteNumber);
      },
    },
  });
}

// --- Presets ---
function populatePresets() {
  const sel = document.getElementById("presetSelect");
  for (const name of Object.keys(PRESETS)) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  // Load user presets from localStorage
  const userPresets = JSON.parse(
    localStorage.getItem("synthModular_userPresets") || "{}",
  );
  for (const name of Object.keys(userPresets)) {
    const opt = document.createElement("option");
    opt.value = "user:" + name;
    opt.textContent = "* " + name;
    sel.appendChild(opt);
  }
  sel.addEventListener("change", () => loadPreset(sel.value));

  // Sequencer presets
  const seqSel = document.getElementById("seqPresetSelect");
  for (const name of Object.keys(SEQ_PRESETS)) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    seqSel.appendChild(opt);
  }
  seqSel.addEventListener("change", () => {
    const preset = SEQ_PRESETS[seqSel.value];
    if (preset) {
      seq.loadPattern(preset.pattern);
      document.getElementById("seqBPM").value = preset.bpm;
      seq.setBPM(preset.bpm);
      updateSequencerUI();
    }
  });
}

function loadPreset(name) {
  let preset;
  if (name.startsWith("user:")) {
    const userPresets = JSON.parse(
      localStorage.getItem("synthModular_userPresets") || "{}",
    );
    preset = userPresets[name.slice(5)];
  } else {
    preset = PRESETS[name];
  }
  if (!preset) return;
  for (const [key, val] of Object.entries(preset)) {
    synth.setParam(key, val);
    const el = document.querySelector(`[data-param="${key}"]`);
    if (el) {
      el.value = val;
      const display = document.querySelector(`[data-for="${key}"]`);
      if (display) display.textContent = formatVal(key, val);
    }
  }
  // Update master vol separately
  document.getElementById("masterVolume").value =
    preset.masterVolume || 0.7;
  document.getElementById("masterVolumeVal").textContent = (
    preset.masterVolume || 0.7
  ).toFixed(2);
  drawEnvelope();
}

document.getElementById("savePresetBtn").addEventListener("click", () => {
  const name = prompt("Preset name:");
  if (!name) return;
  const userPresets = JSON.parse(
    localStorage.getItem("synthModular_userPresets") || "{}",
  );
  userPresets[name] = { ...synth.params };
  localStorage.setItem(
    "synthModular_userPresets",
    JSON.stringify(userPresets),
  );
  const sel = document.getElementById("presetSelect");
  const opt = document.createElement("option");
  opt.value = "user:" + name;
  opt.textContent = "* " + name;
  sel.appendChild(opt);
  sel.value = "user:" + name;
});

// --- Control binding ---
function bindControls() {
  document.querySelectorAll("[data-param]").forEach((el) => {
    const param = el.dataset.param;
    const handler = () => {
      let val = el.value;
      if (el.type === "range" || el.type === "number")
        val = parseFloat(val);
      if (["octave", "osc2Octave"].includes(param)) val = parseInt(val);
      synth.setParam(param, val);
      const display = document.querySelector(`[data-for="${param}"]`);
      if (display) display.textContent = formatVal(param, val);
      if (["attack", "decay", "sustain", "release"].includes(param))
        drawEnvelope();
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });

  // Master volume
  const mv = document.getElementById("masterVolume");
  mv.addEventListener("input", () => {
    synth.setParam("masterVolume", parseFloat(mv.value));
    document.getElementById("masterVolumeVal").textContent = parseFloat(
      mv.value,
    ).toFixed(2);
  });

  // Sequencer controls
  document
    .getElementById("seqPlayBtn")
    .addEventListener("click", async () => {
      await synth.init();
      synth.resume();
      seq.start();
      document.getElementById("seqPlayBtn").classList.add("active");
    });
  document.getElementById("seqStopBtn").addEventListener("click", () => {
    seq.stop();
    document.getElementById("seqPlayBtn").classList.remove("active");
  });
  document.getElementById("seqBPM").addEventListener("input", (e) => {
    seq.setBPM(parseInt(e.target.value));
  });
  document
    .getElementById("seqRandomBtn")
    .addEventListener("click", () => {
      const scale = document.getElementById("seqScale").value;
      seq.randomize(scale);
      updateSequencerUI();
    });
}

function formatVal(param, val) {
  if (typeof val === "number") {
    if (param === "filterCutoff") return Math.round(val) + " Hz";
    if (val >= 100) return Math.round(val).toString();
    if (val >= 10) return val.toFixed(1);
    return val.toFixed(val < 0.01 ? 4 : 2);
  }
  return val;
}

// --- Keyboard ---
function buildKeyboard() {
  const kb = document.getElementById("keyboard");
  const startNote = 48; // C3
  const numOctaves = 3;
  const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
  const blackNotes = [1, 3, -1, 6, 8, 10, -1];

  for (let oct = 0; oct < numOctaves; oct++) {
    const octBase = startNote + oct * 12;
    for (let i = 0; i < 7; i++) {
      const note = octBase + whiteNotes[i];
      const key = document.createElement("div");
      key.className = "key white";
      key.dataset.note = note;
      key.innerHTML = `<span class="key-label">${noteToName(note)}</span>`;
      kb.appendChild(key);

      if (blackNotes[i] >= 0) {
        const bNote = octBase + blackNotes[i];
        const bKey = document.createElement("div");
        bKey.className = "key black";
        bKey.dataset.note = bNote;
        kb.appendChild(bKey);
      }
    }
  }

  // Mouse/touch events
  let mouseDown = false;
  kb.addEventListener("mousedown", (e) => {
    mouseDown = true;
    const key = e.target.closest(".key");
    if (key) playKey(key);
  });
  kb.addEventListener("mouseover", (e) => {
    if (!mouseDown) return;
    const key = e.target.closest(".key");
    if (key) playKey(key);
  });
  kb.addEventListener("mouseup", () => {
    mouseDown = false;
    synth.allNotesOff();
    releaseAllKeys();
  });
  kb.addEventListener("mouseleave", () => {
    if (mouseDown) {
      mouseDown = false;
      synth.allNotesOff();
      releaseAllKeys();
    }
  });

  kb.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      handleTouch(e);
    },
    { passive: false },
  );
  kb.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      handleTouch(e);
    },
    { passive: false },
  );
  kb.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      synth.allNotesOff();
      releaseAllKeys();
    },
    { passive: false },
  );

  // Computer keyboard
  const keyMap = {
    a: 48,
    w: 49,
    s: 50,
    e: 51,
    d: 52,
    f: 53,
    t: 54,
    g: 55,
    y: 56,
    h: 57,
    u: 58,
    j: 59,
    k: 60,
    o: 61,
    l: 62,
    p: 63,
    ";": 64,
  };
  const keysDown = new Set();
  document.addEventListener("keydown", async (e) => {
    if (
      e.repeat ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "SELECT"
    )
      return;
    const note = keyMap[e.key.toLowerCase()];
    if (note !== undefined && !keysDown.has(e.key)) {
      keysDown.add(e.key);
      await synth.init();
      synth.resume();
      synth.noteOn(note);
      const keyEl = kb.querySelector(`[data-note="${note}"]`);
      if (keyEl) keyEl.classList.add("active");
    }
  });
  document.addEventListener("keyup", (e) => {
    const note = keyMap[e.key.toLowerCase()];
    if (note !== undefined) {
      keysDown.delete(e.key);
      synth.noteOff(note);
      const keyEl = kb.querySelector(`[data-note="${note}"]`);
      if (keyEl) keyEl.classList.remove("active");
    }
  });
}

function playKey(key) {
  synth.init().then(() => {
    synth.resume();
    const note = parseInt(key.dataset.note);
    synth.noteOn(note);
    key.classList.add("active");
  });
}

function releaseAllKeys() {
  document
    .querySelectorAll(".key.active")
    .forEach((k) => k.classList.remove("active"));
}

function handleTouch(e) {
  synth.allNotesOff();
  releaseAllKeys();
  for (const touch of e.touches) {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.closest(".key")) {
      playKey(el.closest(".key"));
    }
  }
}

// --- Sequencer UI ---
function buildSequencer() {
  const grid = document.getElementById("seqGrid");
  const notes = document.getElementById("seqNotes");
  grid.innerHTML = "";
  notes.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    const step = document.createElement("div");
    step.className =
      "seq-step" + (seq.pattern[i].active ? " active" : "");
    step.dataset.step = i;
    step.addEventListener("click", () => {
      const isActive = seq.toggleStep(i);
      step.classList.toggle("active", isActive);
    });
    grid.appendChild(step);

    const noteInput = document.createElement("select");
    noteInput.className = "seq-note-select";
    noteInput.dataset.step = i;
    for (let n = 24; n <= 84; n++) {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = noteToName(n);
      if (n === seq.pattern[i].note) opt.selected = true;
      noteInput.appendChild(opt);
    }
    noteInput.addEventListener("change", () => {
      seq.setStepNote(i, parseInt(noteInput.value));
    });
    notes.appendChild(noteInput);
  }

  seq.onStep = (stepIdx) => {
    document.querySelectorAll(".seq-step").forEach((s, i) => {
      s.classList.toggle("current", i === stepIdx);
    });
  };
}

function updateSequencerUI() {
  const steps = document.querySelectorAll(".seq-step");
  const noteSelects = document.querySelectorAll(".seq-note-select");
  for (let i = 0; i < 16; i++) {
    if (steps[i])
      steps[i].classList.toggle("active", seq.pattern[i].active);
    if (noteSelects[i]) noteSelects[i].value = seq.pattern[i].note;
  }
}

// --- Envelope Display ---
function drawEnvelope() {
  const canvas = document.getElementById("envCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const a = synth.params.attack;
  const d = synth.params.decay;
  const s = synth.params.sustain;
  const r = synth.params.release;
  const total = a + d + 0.3 + r;

  const ax = (a / total) * w;
  const dx = ax + (d / total) * w;
  const sx = dx + (0.3 / total) * w;
  const rx = w;

  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(ax, 4);
  ctx.lineTo(dx, h - s * (h - 4));
  ctx.lineTo(sx, h - s * (h - 4));
  ctx.lineTo(rx, h);
  ctx.strokeStyle = "#b388ff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(179, 136, 255, 0.1)";
  ctx.fill();
}

// --- Visualization ---
function startVisualization() {
  const canvas = document.getElementById("vizCanvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width =
      canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height =
      canvas.parentElement.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      hue: Math.random() * 60 + 10,
    });
  }

  function draw() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.fillStyle = "rgba(10, 10, 15, 0.3)";
    ctx.fillRect(0, 0, w, h);

    const freqData = synth.getFrequencyData();
    const waveData = synth.getWaveformData();

    if (freqData.length > 0) {
      // Frequency bars
      const barCount = 64;
      const barW = w / barCount;
      const step = Math.floor(freqData.length / barCount);
      for (let i = 0; i < barCount; i++) {
        const val = freqData[i * step] / 255;
        const barH = val * h * 0.6;
        const hue = 20 + i * 3;
        ctx.fillStyle = `hsla(${hue}, 80%, 55%, ${0.3 + val * 0.5})`;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }

      // Waveform
      if (waveData.length > 0) {
        ctx.beginPath();
        const sliceW = w / waveData.length;
        for (let i = 0; i < waveData.length; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * sliceW, y);
        }
        ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Particles react to audio
      const bass =
        freqData.slice(0, 10).reduce((a, b) => a + b, 0) / (10 * 255);
      particles.forEach((p) => {
        p.x += p.vx + bass * 2;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + bass * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${0.2 + bass * 0.5})`;
        ctx.fill();
      });
    }

    vizAnimId = requestAnimationFrame(draw);
  }
  draw();
}

// --- Start ---
document.addEventListener(
  "click",
  () => {
    synth.init();
    synth.resume();
  },
  { once: true },
);
initApp();
