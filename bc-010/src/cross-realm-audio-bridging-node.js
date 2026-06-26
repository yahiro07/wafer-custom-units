export function createCrossRealmAudioBridgingNode(
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
