function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const PITCH_IDS = {
  kickPitch: "Kick",
  snarePitch: "Snare",
  hihatPitch: "HiHat",
  tom1Pitch: "Tom1",
  tom2Pitch: "Tom2",
  tom3Pitch: "Tom3",
};

const AUTOMATION_PARAM_MAP = {
  effectLevel: { type: "linear", min: 0, max: 1 },
  kickPitch: { type: "linear", min: 0, max: 1 },
  snarePitch: { type: "linear", min: 0, max: 1 },
  hihatPitch: { type: "linear", min: 0, max: 1 },
  tom1Pitch: { type: "linear", min: 0, max: 1 },
  tom2Pitch: { type: "linear", min: 0, max: 1 },
  tom3Pitch: { type: "linear", min: 0, max: 1 },
};

function toNormalized(spec, internal) {
  return ((internal ?? spec.min) - spec.min) / (spec.max - spec.min);
}

function fromNormalized(spec, value) {
  const normalized = clamp01(value);
  return spec.min + normalized * (spec.max - spec.min);
}

export function createAutomationInput(getContext) {
  return {
    getParameterSpecs() {
      return Object.keys(AUTOMATION_PARAM_MAP).map((id) => ({ id }));
    },
    getParameter(id) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      const { beat } = getContext();
      if (id === "effectLevel") {
        return toNormalized(spec, beat.effectMix);
      }
      const instrumentName = PITCH_IDS[id];
      return toNormalized(spec, beat.getPitch(instrumentName));
    },
    setParameter(id, value) {
      const spec = AUTOMATION_PARAM_MAP[id];
      if (!spec) {
        return;
      }
      const { beat, ui, player } = getContext();
      const next = fromNormalized(spec, value);
      if (id === "effectLevel") {
        beat.effectMix = next;
        player.updateEffect();
        ui.effectSlider.value = next;
        return;
      }
      const instrumentName = PITCH_IDS[id];
      beat.setPitch(instrumentName, next);
      ui.pitchSliders.setPitch(instrumentName, next);
    },
  };
}
