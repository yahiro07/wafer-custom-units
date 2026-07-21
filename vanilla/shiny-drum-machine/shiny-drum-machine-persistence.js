import { clone, RESET_BEAT } from "./shiny-drum-machine-data.js";

export function createPersistedState(beat) {
  return { beat: beat.toObject() };
}

export function parsePersistedState(state) {
  if (!state || typeof state !== "object") return null;

  const beat = state.beat ?? state;
  if (
    typeof beat.kitIndex !== "number" ||
    typeof beat.effectIndex !== "number"
  ) {
    return null;
  }

  return clone({ ...RESET_BEAT, ...beat });
}
