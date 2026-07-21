import { queryUnitInterface } from "wafer-host/unit-types";

export const unitInterface = queryUnitInterface("wafer-v01");

export type SynthSetupContext = {
  audioContext: AudioContext;
  destinationNode: AudioNode;
};

export function createSynthSetupContext(): SynthSetupContext {
  const audioContext = unitInterface?.audioContext ?? new AudioContext();
  const destinationNode =
    unitInterface?.audioOutputNode ?? audioContext.destination;
  return { audioContext, destinationNode };
}
