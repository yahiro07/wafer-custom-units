import type { EngineParams } from "@/lib/audio/types";

export interface NavItem {
  id: string;
  label: string;
}

/**
 * Single source of truth for the nav and the scroll-spy. Exported as a stable
 * module-level constant so hooks can depend on it without re-running effects.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home" },
  { id: "instrument", label: "Play" },
  { id: "about", label: "About" },
  { id: "features", label: "Features" },
  { id: "contact", label: "Contact" },
];

export const SECTION_IDS: string[] = NAV_ITEMS.map((item) => item.id);

/** Sensible, musical starting point for the synth. */
export const DEFAULT_ENGINE_PARAMS: EngineParams = {
  waveform: "sawtooth",
  cutoff: 2200,
  resonance: 6,
  delayTime: 0.28,
  delayFeedback: 0.35,
  volume: 0.7,
  attack: 0.01,
  decay: 0.18,
  sustain: 0.6,
  release: 0.35,
};

/** Waveform options surfaced in the Controls UI. */
export const WAVEFORMS: EngineParams["waveform"][] = [
  "sine",
  "triangle",
  "sawtooth",
  "square",
];
