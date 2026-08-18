function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const WAVEFORMS = [
  "sine",
  "square",
  "sawtooth",
  "triangle",
  "w9999",
  "n0",
  "n1",
];

const RATIOS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const OP_DEFAULT = {
  g: 0,
  w: "sine",
  t: 1,
  f: 0,
  v: 0.5,
  a: 0,
  h: 0.01,
  d: 0.01,
  s: 0,
  r: 0.05,
  p: 1,
  q: 1,
  k: 0,
};

const AUTOMATION_PARAM_MAP = {
  masterVol: { type: "linear", min: 0, max: 1 },
  reverbLev: { type: "linear", min: 0, max: 1 },
  op1Waveform: { type: "enum", values: WAVEFORMS },
  op1Ratio: { type: "enum", values: RATIOS },
  op1Offset: { type: "linear", min: -8, max: 8 },
  op1Volume: { type: "linear", min: 0, max: 1 },
  op1Attack: { type: "linear", min: 0, max: 1 },
  op1Hold: { type: "linear", min: 0, max: 0.5 },
  op1Decay: { type: "linear", min: 0, max: 2 },
  op1Sustain: { type: "linear", min: 0, max: 1 },
  op1Release: { type: "linear", min: 0, max: 2 },
  op2Waveform: { type: "enum", values: WAVEFORMS },
  op2Ratio: { type: "enum", values: RATIOS },
  op2Offset: { type: "linear", min: -8, max: 8 },
  op2Level: { type: "linear", min: 0, max: 20 },
  op2Attack: { type: "linear", min: 0, max: 1 },
  op2Hold: { type: "linear", min: 0, max: 0.5 },
  op2Decay: { type: "linear", min: 0, max: 2 },
  op2Sustain: { type: "linear", min: 0, max: 10 },
  op2Release: { type: "linear", min: 0, max: 2 },
};

function toNormalized(spec, internal) {
  if (spec.type === "enum") {
    const index = spec.values.indexOf(internal);
    return (index < 0 ? 0 : index) / (spec.values.length - 1);
  }
  return ((internal ?? spec.min) - spec.min) / (spec.max - spec.min);
}

function fromNormalized(spec, value) {
  const normalized = clamp01(value);
  if (spec.type === "enum") {
    return spec.values[Math.round(normalized * (spec.values.length - 1))];
  }
  return spec.min + normalized * (spec.max - spec.min);
}

function nearestRatio(value) {
  let best = RATIOS[0];
  let bestDist = Infinity;
  for (const ratio of RATIOS) {
    const dist = Math.abs(ratio - value);
    if (dist < bestDist) {
      bestDist = dist;
      best = ratio;
    }
  }
  return best;
}

function currentOps() {
  const pg = synth.pg?.[0] ?? 0;
  const program = synth.program[pg];
  if (!program.p) {
    program.p = [];
  }
  return program.p;
}

function readOp(index) {
  const op = currentOps()[index];
  if (!op) {
    return { ...OP_DEFAULT, g: index === 1 ? 1 : 0 };
  }
  return op;
}

function writeOp(index, patch) {
  const ops = currentOps();
  while (ops.length <= index) {
    ops.push({ ...OP_DEFAULT, g: ops.length === 1 ? 1 : 0 });
  }
  Object.assign(ops[index], patch, { g: index === 1 ? 1 : 0 });
}

function getParameter(id) {
  switch (id) {
    case "masterVol":
      return Number(synth.masterVol);
    case "reverbLev":
      return Number(synth.reverbLev);
    case "op1Waveform": {
      const w = readOp(0).w;
      return WAVEFORMS.includes(w) ? w : "sine";
    }
    case "op1Ratio":
      return nearestRatio(readOp(0).t ?? OP_DEFAULT.t);
    case "op1Offset":
      return readOp(0).f ?? OP_DEFAULT.f;
    case "op1Volume":
      return readOp(0).v ?? OP_DEFAULT.v;
    case "op1Attack":
      return readOp(0).a ?? OP_DEFAULT.a;
    case "op1Hold":
      return readOp(0).h ?? OP_DEFAULT.h;
    case "op1Decay":
      return readOp(0).d ?? OP_DEFAULT.d;
    case "op1Sustain":
      return readOp(0).s ?? OP_DEFAULT.s;
    case "op1Release":
      return readOp(0).r ?? OP_DEFAULT.r;
    case "op2Waveform": {
      const w = readOp(1).w;
      return WAVEFORMS.includes(w) ? w : "sine";
    }
    case "op2Ratio":
      return nearestRatio(readOp(1).t ?? OP_DEFAULT.t);
    case "op2Offset":
      return readOp(1).f ?? OP_DEFAULT.f;
    case "op2Level":
      return readOp(1).v ?? OP_DEFAULT.v;
    case "op2Attack":
      return readOp(1).a ?? OP_DEFAULT.a;
    case "op2Hold":
      return readOp(1).h ?? OP_DEFAULT.h;
    case "op2Decay":
      return readOp(1).d ?? OP_DEFAULT.d;
    case "op2Sustain":
      return readOp(1).s ?? OP_DEFAULT.s;
    case "op2Release":
      return readOp(1).r ?? OP_DEFAULT.r;
    default:
      return;
  }
}

function setParameter(id, value) {
  switch (id) {
    case "masterVol":
      document.getElementById("vol").value = value;
      Ctrl();
      return;
    case "reverbLev":
      document.getElementById("rev").value = value;
      Ctrl();
      return;
    case "op1Waveform":
      writeOp(0, { w: value });
      return;
    case "op1Ratio":
      writeOp(0, { t: value });
      return;
    case "op1Offset":
      writeOp(0, { f: value });
      return;
    case "op1Volume":
      writeOp(0, { v: value });
      return;
    case "op1Attack":
      writeOp(0, { a: value });
      return;
    case "op1Hold":
      writeOp(0, { h: value });
      return;
    case "op1Decay":
      writeOp(0, { d: value });
      return;
    case "op1Sustain":
      writeOp(0, { s: value });
      return;
    case "op1Release":
      writeOp(0, { r: value });
      return;
    case "op2Waveform":
      writeOp(1, { w: value });
      return;
    case "op2Ratio":
      writeOp(1, { t: value });
      return;
    case "op2Offset":
      writeOp(1, { f: value });
      return;
    case "op2Level":
      writeOp(1, { v: value });
      return;
    case "op2Attack":
      writeOp(1, { a: value });
      return;
    case "op2Hold":
      writeOp(1, { h: value });
      return;
    case "op2Decay":
      writeOp(1, { d: value });
      return;
    case "op2Sustain":
      writeOp(1, { s: value });
      return;
    case "op2Release":
      writeOp(1, { r: value });
      return;
  }
}

const automationInput = {
  getParameterSpecs() {
    return Object.entries(AUTOMATION_PARAM_MAP).map(([id, spec]) => {
      if (spec.type === "enum") {
        return { id, steps: spec.values.length };
      }
      return { id };
    });
  },
  getParameter(id) {
    const spec = AUTOMATION_PARAM_MAP[id];
    if (!spec) {
      return;
    }
    return toNormalized(spec, getParameter(id));
  },
  setParameter(id, value) {
    const spec = AUTOMATION_PARAM_MAP[id];
    if (!spec) {
      return;
    }
    setParameter(id, fromNormalized(spec, value));
  },
};
