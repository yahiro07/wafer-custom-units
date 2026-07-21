const unitInterface = window.queryUnitInterface?.("wafer-v01");
const audioContext = unitInterface?.audioContext ?? new AudioContext();

let cleanupCallbacks = [];
let persistenceHandlers = {
  emitState: null,
  applyState: null,
};
let pendingPersistedState = null;

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
  registerPersistenceHandlers(handlers) {
    persistenceHandlers = handlers;
    if (pendingPersistedState) {
      handlers.applyState?.(pendingPersistedState);
      pendingPersistedState = null;
    }
  },
  unregisterPersistenceHandlers() {
    persistenceHandlers = {
      emitState: null,
      applyState: null,
    };
  },
  completeSetup() {
    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "effect",
        viewSize: [550, 334],
      },
      persistence: {
        emitState() {
          return persistenceHandlers.emitState?.();
        },
        applyState(state) {
          if (!persistenceHandlers.applyState) {
            pendingPersistedState = state;
            return;
          }
          persistenceHandlers.applyState(state);
        },
      },
      cleanup() {
        cleanupCallbacks.forEach((fn) => fn());
      },
    });
  },
};
