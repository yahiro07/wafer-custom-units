function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randBool(probability) {
  return Math.random() < probability;
}

function maybe(probability, value) {
  return randBool(probability) ? value : undefined;
}

function maybe2(probability, value, altValue) {
  return randBool(probability) ? value : altValue;
}

function randChicken() {
  return [0, 50, 100][randInt(0, 2)];
}

function generateRandomPreset() {
  var s_osc1 = randBool(0.7);
  var s_osc2 = randBool(0.7);
  if (!s_osc1 && !s_osc2) {
    if (Math.random() < 0.5) s_osc1 = true;
    else s_osc2 = true;
  }

  const randFine = () => randInt(30, 70);

  const attrs = {
    s_glide: maybe(0.3, true),
    k_glide: randInt(0, 100),
    c_freq1: randChicken(),
    c_freq2: randChicken(),
    k_fine1: randFine(),
    k_fine2: randFine(),
    c_wave1: randChicken(),
    c_wave2: randChicken(),
    k_vol1: randInt(30, 100),
    k_vol2: randInt(30, 100),
    s_osc1: s_osc1,
    s_osc2: s_osc2,
    k_cut: maybe(0.6, randInt(0, 100)),
    k_emp: randInt(0, 100),
    k_amo: randInt(0, 100),
    k_fa: maybe(0.3, randInt(1, 100)),
    k_fd: randInt(0, maybe2(0.8, 50, 100)),
    k_fd: randInt(0, 100),
    k_fs: randInt(0, 100),
    k_la: maybe(0.3, randInt(1, 100)),
    k_ld: randInt(0, maybe2(0.8, 30, 100)),
    k_ls: randInt(0, 100),
    k_vol: randInt(40, 90),
    k_dly: maybe(0.3, randInt(1, 100)),
  };

  const params = Object.assign({}, basePreset);
  Object.keys(attrs).forEach((key) => {
    if (attrs[key] !== undefined) {
      params[key] = attrs[key];
    }
  });
  return params;
}
