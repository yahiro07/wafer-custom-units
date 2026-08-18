const AUTOMATION_PARAM_MAP = {
  glideOn: { id: "s_glide", type: "switch" },
  glideTime: { id: "k_glide", type: "knob" },
  osc1On: { id: "s_osc1", type: "switch" },
  osc1Wave: { id: "c_wave1", type: "knob" },
  osc1Freq: { id: "c_freq1", type: "knob" },
  osc1Fine: { id: "k_fine1", type: "knob" },
  osc1Vol: { id: "k_vol1", type: "knob" },
  osc2On: { id: "s_osc2", type: "switch" },
  osc2Wave: { id: "c_wave2", type: "knob" },
  osc2Freq: { id: "c_freq2", type: "knob" },
  osc2Fine: { id: "k_fine2", type: "knob" },
  osc2Vol: { id: "k_vol2", type: "knob" },
  filterCutoff: { id: "k_cut", type: "knob" },
  filterEmphasis: { id: "k_emp", type: "knob" },
  filterAmount: { id: "k_amo", type: "knob" },
  filterAttack: { id: "k_fa", type: "knob" },
  filterDecay: { id: "k_fd", type: "knob" },
  filterSustain: { id: "k_fs", type: "knob" },
  ampAttack: { id: "k_la", type: "knob" },
  ampDecay: { id: "k_ld", type: "knob" },
  ampSustain: { id: "k_ls", type: "knob" },
  volume: { id: "k_vol", type: "knob" },
  delay: { id: "k_dly", type: "knob" },
};

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

const automationInput = {
  getParameterSpecs() {
    return [
      { id: "glideOn", steps: 2 },
      { id: "glideTime" },
      { id: "osc1Freq", steps: 3 },
      { id: "osc1Fine" },
      { id: "osc1Wave", steps: 3 },
      { id: "osc1Vol" },
      { id: "osc1On", steps: 2 },
      { id: "osc2Freq", steps: 3 },
      { id: "osc2Fine" },
      { id: "osc2Wave", steps: 3 },
      { id: "osc2Vol" },
      { id: "osc2On", steps: 2 },
      { id: "filterCutoff" },
      { id: "filterEmphasis" },
      { id: "filterAmount" },
      { id: "filterAttack" },
      { id: "filterDecay" },
      { id: "filterSustain" },
      { id: "ampAttack" },
      { id: "ampDecay" },
      { id: "ampSustain" },
      { id: "volume" },
      { id: "delay" },
    ];
  },
  getParameter(id) {
    const spec = AUTOMATION_PARAM_MAP[id];
    if (!spec) {
      return;
    }
    const internal = ctrl.getParameter(spec.id);
    if (spec.type === "switch") {
      return internal ? 1 : 0;
    }
    return (internal ?? 0) / 100;
  },
  setParameter(id, value) {
    const spec = AUTOMATION_PARAM_MAP[id];
    if (!spec) {
      return;
    }
    const normalized = clamp01(value);
    if (spec.type === "switch") {
      ctrl.setParameter(spec.id, normalized >= 0.5);
      return;
    }
    ctrl.setParameter(spec.id, normalized * 100);
  },
};
