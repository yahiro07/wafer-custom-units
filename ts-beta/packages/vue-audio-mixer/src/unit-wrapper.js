const unitInterface = window.queryUnitInterface?.("wafer-v01");
const audioContext = unitInterface?.audioContext ?? new AudioContext();

let cleanupCallbacks = [];

export const unitWrapper = {
  getAudioContext() {
    return audioContext;
  },
  createChannelInputNode(channelId) {
    return (
      unitInterface?.createAdditionalAudioInputNode(channelId) ??
      audioContext.createGain()
    );
  },
  getMasterOutputNode() {
    return unitInterface?.audioOutputNode ?? audioContext.createGain();
  },
  addCleanupCallback(fn) {
    cleanupCallbacks.push(fn);
  },
  completeSetup() {
    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "effect",
        viewSize: [550, 334],
      },
      cleanup() {
        cleanupCallbacks.forEach((fn) => fn());
      },
    });
  },
};
