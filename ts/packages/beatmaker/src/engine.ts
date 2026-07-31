import { queryUnitInterface } from "wafer-host/unit-types";
import { padItems } from "./definitions";

export const unitInterface = queryUnitInterface("wafer-v01");
const audioContext = unitInterface?.audioContext ?? new AudioContext();
const audioDestinationNode =
  unitInterface?.audioOutputNode ?? audioContext.destination;

type AudioItem = {
  audio: HTMLAudioElement;
  audioBlobObjectURL: string;
  mediaElementSource: MediaElementAudioSourceNode;
  duration?: number;
  playing: boolean;
};

async function loadMetadataDurationAsync(
  audio: HTMLAudioElement,
): Promise<number> {
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return audio.duration;
  }
  return new Promise((resolve, reject) => {
    audio.addEventListener("loadedmetadata", () => resolve(audio.duration), {
      once: true,
    });
    audio.addEventListener("error", reject, { once: true });
  });
}

async function fetchAudioBlobObjectURL(uri: string): Promise<string> {
  const ext = uri.split(".").pop();
  const buf = await fetch(uri).then((r) => r.arrayBuffer());
  return URL.createObjectURL(new Blob([buf], { type: `audio/${ext}` }));
}

function createPlayer() {
  const audioItemMap = new Map<string, AudioItem>();

  const audioBlobObjectURLPromises = new Map<string, Promise<string>>();

  async function wrapFetchAudioBlobObjectURL(uri: string): Promise<string> {
    const promise = audioBlobObjectURLPromises.get(uri);
    if (promise) {
      return await promise;
    }
    const newPromise = fetchAudioBlobObjectURL(uri);
    audioBlobObjectURLPromises.set(uri, newPromise);
    return await newPromise;
  }

  async function getAudioItemOrCreate(padId: string): Promise<AudioItem> {
    let audioItem = audioItemMap.get(padId);
    if (!audioItem) {
      const padItem = padItems.find((padItem) => padItem.id === padId);
      if (!padItem) {
        throw new Error(`Pad item not found for padId: ${padId}`);
      }
      const uri = padItem.beat.startsWith("aks")
        ? `beats/${padItem.beat}.wav`
        : `beats/0_${padItem.beat}.flac`;
      console.log(`load audio ${uri}`);
      const audioBlobObjectURL = await wrapFetchAudioBlobObjectURL(uri);
      const audio = new Audio(audioBlobObjectURL);
      await loadMetadataDurationAsync(audio);
      console.log(`audio loaded duration:`, audio.duration);
      audio.loop = !padItem.oneShot;
      const mediaElementSource = audioContext.createMediaElementSource(audio);
      audioItem = {
        audio,
        audioBlobObjectURL,
        mediaElementSource,
        playing: false,
      };
      audioItemMap.set(padId, audioItem);
    }
    return audioItem;
  }

  function forEachAudioItem(callback: (audio: HTMLAudioElement) => void) {
    for (const audioItem of audioItemMap.values()) {
      callback(audioItem.audio);
    }
  }

  const self = {
    async loadAudioItemDuration(padId: string): Promise<number | null> {
      const audioItem = await getAudioItemOrCreate(padId);
      return audioItem.audio.duration ?? null;
    },
    async playPad(
      padId: string,
      timePosition: number,
      playbackRate: number,
      completeCallback?: () => void,
    ) {
      const audioItem = await getAudioItemOrCreate(padId);
      if (audioItem && !audioItem.playing) {
        const { audio, mediaElementSource } = audioItem;
        mediaElementSource.connect(audioDestinationNode);
        console.log(
          `start audio ${padId} at ${timePosition}, playbackRate ${playbackRate}`,
        );
        audio.currentTime = timePosition;
        audio.playbackRate = playbackRate;
        audio.play();
        if (completeCallback) {
          audio.addEventListener(
            "ended",
            () => {
              self.pausePad(padId);
              completeCallback();
            },
            { once: true },
          );
        }
        audioItem.playing = true;
      }
    },
    async pausePad(padId: string) {
      const audioItem = await getAudioItemOrCreate(padId);
      if (audioItem.playing) {
        const { audio, mediaElementSource } = audioItem;
        mediaElementSource.disconnect();
        audio.pause();
        audioItem.playing = false;
      }
    },
    updateAudioAttrsAll(options: { playbackRate?: number }) {
      forEachAudioItem((audio) => {
        if (options.playbackRate !== undefined) {
          audio.playbackRate = options.playbackRate;
        }
      });
    },
    cleanup() {
      for (const audioItem of audioItemMap.values()) {
        audioItem.audio.pause();
        audioItem.audio.remove();
        URL.revokeObjectURL(audioItem.audioBlobObjectURL);
        audioItem.mediaElementSource.disconnect();
      }
      audioItemMap.clear();
      audioBlobObjectURLPromises.clear();
    },
  };
  return self;
}
export const player = createPlayer();

type TimeAnchor = {
  time: number;
  transportBarPosition: number;
};

function calculateStartTimePosition(
  timeAnchor: TimeAnchor | undefined,
  bpm: number,
  audioDuration: number,
  playbackRate: number,
  audioContextCurrentTime: number,
): number {
  if (!timeAnchor) return 0;
  if (!(Number.isFinite(audioDuration) && audioDuration > 0)) return 0;
  const { time, transportBarPosition } = timeAnchor;
  const secondsPerBar = 240 / bpm;
  const hostTimePosition =
    transportBarPosition * secondsPerBar + (audioContextCurrentTime - time);
  const mediaTimelinePosition = hostTimePosition * playbackRate;
  return (mediaTimelinePosition + audioDuration) % audioDuration;
}

function createSequencer() {
  let bpm = 80;
  let hostPlaying = false;
  const activePadIds = new Set<string>();
  let timeAnchor: TimeAnchor | undefined;

  const getPlaybackRate = () => bpm / 80;

  const self = {
    playPadOneShot(padId: string, completeCallback: () => void) {
      const playbackRate = getPlaybackRate();
      player.playPad(padId, 0, playbackRate, completeCallback);
    },
    stopPadOneShot(padId: string) {
      player.pausePad(padId);
    },
    async setPadActive(padId: string, active: boolean) {
      if (active) {
        activePadIds.add(padId);
        if (!activePadIds.has(padId)) return;
        if (hostPlaying) {
          const audioDuration = await player.loadAudioItemDuration(padId);
          if (!audioDuration) {
            console.warn(`audio duration not available for padId: ${padId}`);
            return;
          }
          const playbackRate = getPlaybackRate();
          const startTimePosition = calculateStartTimePosition(
            timeAnchor,
            bpm,
            audioDuration,
            playbackRate,
            audioContext.currentTime,
          );
          player.playPad(padId, startTimePosition, playbackRate);
        }
      } else {
        if (hostPlaying) {
          player.pausePad(padId);
        }
        activePadIds.delete(padId);
      }
    },
    setBpm(newBpm: number) {
      bpm = newBpm;
      const playbackRate = getPlaybackRate();
      player.updateAudioAttrsAll({ playbackRate });
    },
    onHostStart() {
      const playbackRate = getPlaybackRate();
      hostPlaying = true;
      activePadIds.forEach((padId) => {
        player.playPad(padId, 0, playbackRate);
      });
    },
    onHostStop() {
      activePadIds.forEach((padId) => {
        player.pausePad(padId);
      });
      hostPlaying = false;
    },
    onHostScheduling(timeFrom: number, barFrom: number, _bpm: number) {
      if (_bpm !== bpm) {
        self.setBpm(_bpm);
      }
      timeAnchor = { time: timeFrom, transportBarPosition: barFrom };
    },
  };
  return self;
}
export const sequencer = createSequencer();
