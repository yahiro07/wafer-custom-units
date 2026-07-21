import presetData from "./presetData";

const DEFAULT_PARAMETERS = presetData["- INIT -"];

export const PARAMETER_KEYS = Object.keys(DEFAULT_PARAMETERS).filter(
  (key) => key !== "vcoPan",
);

export function extractParameters(state) {
  return Object.fromEntries(
    PARAMETER_KEYS.map((key) => [key, state[key]]),
  );
}

export function parsePersistedState(saved) {
  if (!saved || typeof saved !== "object") return null;

  const { presetName, parameters } = saved;
  if (!parameters || typeof parameters !== "object") return null;

  return {
    presetName: typeof presetName === "string" ? presetName : null,
    parameters: { ...DEFAULT_PARAMETERS, ...parameters },
  };
}

export function applyParameters(setters, parameters) {
  PARAMETER_KEYS.forEach((key) => {
    const setter = setters[key];
    if (setter && key in parameters) {
      setter(parameters[key]);
    }
  });
}

export function createApplyPersistedState({
  presetData: presets,
  parameterSetters,
  setCurrentPreset,
  getCurrentPreset,
  skipPresetLoadRef,
  onBeforeApply,
}) {
  return (saved) => {
    const persisted = parsePersistedState(saved);
    if (!persisted) return;

    const base =
      persisted.presetName && presets[persisted.presetName]
        ? presets[persisted.presetName]
        : {};

    onBeforeApply?.();
    applyParameters(parameterSetters, { ...base, ...persisted.parameters });

    skipPresetLoadRef.current = true;
    setCurrentPreset(persisted.presetName ?? getCurrentPreset());
  };
}
