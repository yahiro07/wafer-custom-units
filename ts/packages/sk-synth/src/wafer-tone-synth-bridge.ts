import * as Tone from "tone";
import {
  queryUnitInterface,
  NotePort,
  UnitInterface,
} from "wafer-host/unit-types";

type WaferToneSynthBridge = {
  unitInterface: UnitInterface | undefined;
  destinationNode: AudioNode;
  createNotePortAdapted(receiver: {
    triggerAttack(frequency: number, time: number, velocity: number): void;
    triggerRelease(time: number): void;
  }): NotePort;
};

const calculateMidiNoteFrequency = (midiNumber: number) =>
  Math.pow(2, (midiNumber - 69) / 12) * 440;

function createCrossRealmAudioBridgingNode(
  remoteDestinationNode: AudioNode,
  localAudioContext: AudioContext,
) {
  const inputNode = localAudioContext.createGain();
  const localDestination = localAudioContext.createMediaStreamDestination();

  const remoteAudioContext = remoteDestinationNode.context;
  const sourceInRemote = (
    remoteAudioContext as unknown as {
      createMediaStreamSource: (stream: MediaStream) => AudioNode;
    }
  ).createMediaStreamSource(localDestination.stream);

  inputNode.connect(localDestination);
  sourceInRemote.connect(remoteDestinationNode);

  (inputNode as GainNode & { dispose: () => void }).dispose = () => {
    inputNode.disconnect();
    sourceInRemote.disconnect();
    localDestination.stream.getAudioTracks().forEach((track) => track.stop());
  };

  return inputNode;
}

export function createWaferToneSynthBridge(): WaferToneSynthBridge {
  const unitInterface = queryUnitInterface("wafer-v01");
  const toneAudioContext = Tone.getContext().rawContext;
  const wrappedDestinationNode = unitInterface
    ? createCrossRealmAudioBridgingNode(
        unitInterface.audioOutputNode,
        toneAudioContext as AudioContext,
      )
    : toneAudioContext.destination;

  function shiftAudioContextTimeRelative(time: number | undefined): number {
    if (!unitInterface) return time ?? 0;
    const hostAc = unitInterface.audioContext;
    const toneAc = Tone.getContext().rawContext;
    if (time === 0 || time === undefined || time < hostAc.currentTime) {
      return toneAc.currentTime;
    }
    return toneAc.currentTime + (time - hostAc.currentTime);
  }
  let lastNoteNumber = 0;

  return {
    unitInterface,
    destinationNode: wrappedDestinationNode,
    createNotePortAdapted(receiver) {
      return {
        noteOn(noteNumber, time, velocity) {
          time = shiftAudioContextTimeRelative(time);
          receiver.triggerAttack(
            calculateMidiNoteFrequency(noteNumber),
            time,
            velocity ?? 1,
          );
          lastNoteNumber = noteNumber;
        },
        noteOff(noteNumber, time) {
          time = shiftAudioContextTimeRelative(time);
          if (noteNumber === lastNoteNumber) {
            receiver.triggerRelease(time);
          }
        },
      };
    },
  };
}
