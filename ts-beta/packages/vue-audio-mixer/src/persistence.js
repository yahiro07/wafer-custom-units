export function getDefaultParameters() {
  return {
    tracks: [],
    master: {
      pan: 0,
      gain: 1,
      muted: false,
    },
  };
}

function serializableNumber(value, fallback) {
  const number = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(number) ? fallback : number;
}

function parseTrack(track, fallbackTrack) {
  return {
    channelId:
      typeof track.channelId === "string"
        ? track.channelId
        : fallbackTrack.channelId,
    pan: serializableNumber(track.pan, fallbackTrack.pan),
    gain: serializableNumber(track.gain, fallbackTrack.gain),
    muted: track.muted === undefined ? fallbackTrack.muted : !!track.muted,
    hidden: track.hidden === undefined ? fallbackTrack.hidden : !!track.hidden,
  };
}

export function parsePersistedState(state) {
  if (!state || typeof state !== "object") return null;

  let parameters = state.parameters;
  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
    if (Array.isArray(state.tracks) && state.master) {
      parameters = state;
    } else {
      return null;
    }
  }

  const defaults = getDefaultParameters();
  const master = parameters.master ?? defaults.master;

  if (!Array.isArray(parameters.tracks)) return null;

  return {
    tracks: parameters.tracks.map((track, index) =>
      parseTrack(track, defaults.tracks[index] ?? defaults.tracks[0] ?? {
        channelId: `ch${index + 1}`,
        pan: 0,
        gain: 1,
        muted: false,
        hidden: false,
      }),
    ),
    master: {
      pan: serializableNumber(master.pan, defaults.master.pan),
      gain: serializableNumber(master.gain, defaults.master.gain),
      muted: master.muted === undefined ? defaults.master.muted : !!master.muted,
    },
  };
}
