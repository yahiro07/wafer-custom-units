export { default as url } from "./processor?worker&url";

export const id = `SidechainCompressorProcessor` as const;

export type SidechainCompressorProcessorMessages =
  | "sidechain-on"
  | "sidechain-off"
  | "bypass-on"
  | "bypass-off"
  | "logging-on"
  | "logging-off";
