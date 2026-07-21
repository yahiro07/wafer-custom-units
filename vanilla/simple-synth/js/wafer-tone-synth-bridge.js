const calculateMidiNoteFrequency = (midiNumber) =>
  Math.pow(2, (midiNumber - 69) / 12) * 440;

function createCrossRealmAudioBridgingNode(
  remoteDestinationNode,
  localAudioContext,
) {
  const inputNode = localAudioContext.createGain();
  const localDestination = localAudioContext.createMediaStreamDestination();

  const remoteAudioContext = remoteDestinationNode.context;
  const sourceInRemote = remoteAudioContext.createMediaStreamSource(
    localDestination.stream,
  );

  inputNode.connect(localDestination);
  sourceInRemote.connect(remoteDestinationNode);

  inputNode.dispose = () => {
    inputNode.disconnect();
    sourceInRemote.disconnect();
    localDestination.stream.getAudioTracks().forEach((track) => track.stop());
  };

  return inputNode;
}

function createWaferToneSynthBridge() {
  const unitInterface = window.queryUnitInterface?.("wafer-v01");
  const toneAudioContext = Tone.context;
  const wrappedDestinationNode = unitInterface
    ? createCrossRealmAudioBridgingNode(
        unitInterface.audioOutputNode,
        toneAudioContext,
      )
    : toneAudioContext.destination;

  function shiftAudioContextTimeRelative(time) {
    if (!unitInterface) return time ?? 0;
    const hostAc = unitInterface.audioContext;
    if (time === 0 || time === undefined || time < hostAc.currentTime) {
      return toneAudioContext.currentTime;
    }
    return toneAudioContext.currentTime + (time - hostAc.currentTime);
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
