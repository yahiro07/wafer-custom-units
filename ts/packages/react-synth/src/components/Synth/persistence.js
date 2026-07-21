import presetData from "./presetData";

const DEFAULT_PARAMETERS = presetData["- INIT -"];

export const PARAMETER_KEYS = Object.keys(DEFAULT_PARAMETERS);

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
