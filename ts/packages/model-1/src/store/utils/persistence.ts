import { presets } from "@/synth/presets";
import { useSynthStore } from "../synthStore";
import {
  applyExportedParameters,
  applyPresetSettings,
} from "./applyParameters";
import {
  ExportedParameters,
  PersistedSynthState,
} from "./presetExporter";

function isExportedParameters(value: unknown): value is ExportedParameters {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ExportedParameters>;
  return (
    typeof candidate.octave === "number" &&
    Array.isArray(candidate.oscillators) &&
    candidate.noise !== undefined &&
    candidate.filter !== undefined
  );
}

function parsePersistedState(state: unknown): PersistedSynthState | null {
  if (!state || typeof state !== "object") return null;

  const candidate = state as Partial<PersistedSynthState>;
  if (!isExportedParameters(candidate.parameters)) return null;

  return {
    presetName:
      typeof candidate.presetName === "string" ? candidate.presetName : null,
    parameters: candidate.parameters,
  };
}

export function emitPersistedState(): PersistedSynthState {
  const store = useSynthStore.getState();
  return {
    presetName: store.selectedPresetName,
    parameters: store.exportCurrentPreset(),
  };
}

export function applyPersistedState(state: unknown): void {
  const persisted = parsePersistedState(state);
  if (!persisted) return;

  const store = useSynthStore.getState();

  if (persisted.presetName && presets[persisted.presetName]) {
    store.setSelectedPresetName(persisted.presetName);
    applyPresetSettings(store, presets[persisted.presetName]);
  } else {
    store.setSelectedPresetName(persisted.presetName);
  }

  applyExportedParameters(store, persisted.parameters);
}
