import {
  ClockHandlers,
  queryUnitInterface,
  UnitInterface,
} from "wafer-host/unit-types";

export const unitInterface = queryUnitInterface("wafer-v01");
const audioContext = unitInterface?.audioContext ?? new AudioContext();
const audioDestinationNode =
  unitInterface?.audioOutputNode ?? audioContext.destination;

export type BeatSourceItem = {
  id: string;
  uri: string;
  barLength: number;
  originalBpm: number;
};

export type LoopPlayerEngine = {
  unitInterface: UnitInterface | undefined;
  registerBeatSourceItems(items: BeatSourceItem[]): void;
  preloadBeat(id: string): void;
  setBeatState(id: string, enabled: boolean): void;
  playInstantBeat(id: string, endedCallback?: () => void): void;
  stopInstantBeat(id: string): void;
  setBpm(bpm: number): void;
  clockHandlers: ClockHandlers;
  cleanup: () => void;
};

type AudioItem = {
  audio: HTMLAudioElement;
  audioBlobObjectURL: string;
  mediaElementSource: MediaElementAudioSourceNode;
  playing: boolean;
};

async function loadLoopMaterialBlob(beatSource: BeatSourceItem): Promise<Blob> {
  const { uri } = beatSource;
  const ext = uri.split(".").pop();
  const buf = await fetch(uri).then((r) => r.arrayBuffer());
  return new Blob([buf], { type: `audio/${ext}` });
}

async function createAudioItem(beatSource: BeatSourceItem): Promise<AudioItem> {
  const audioBlob = await loadLoopMaterialBlob(beatSource);
  const audioBlobObjectURL = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioBlobObjectURL);
  const mediaElementSource = audioContext.createMediaElementSource(audio);
  return {
    audio,
    audioBlobObjectURL,
    mediaElementSource,
    playing: false,
  };
}

type HostTimeAnchor = {
  time: number;
  transportBarPosition: number;
};

function calculateStartTimePosition(
  timeAnchor: HostTimeAnchor | undefined,
  destinationBpm: number,
  sourceBpm: number,
  sourceBarLength: number,
  playbackRate: number,
  audioContextCurrentTime: number,
): number {
  if (!timeAnchor) return 0;
  const audioDuration = (sourceBarLength * 240) / sourceBpm;
  const { time, transportBarPosition } = timeAnchor;
  const secondsPerBar = 240 / destinationBpm;
  const hostTimePosition =
    transportBarPosition * secondsPerBar + (audioContextCurrentTime - time);
  const mediaTimelinePosition = hostTimePosition * playbackRate;
  return (mediaTimelinePosition + audioDuration) % audioDuration;
}

type SharedStateBus = {
  hostPlaying: boolean;
  hostBpm: number;
  hostTimeAnchor: HostTimeAnchor | undefined;
};

type BeatActor = {
  id: string;
  preload(): void;
  setBeatState(active: boolean): void;
  onHostStart(): void;
  onHostStep(stepIndex: number, time: number): void;
  onHostStop(): void;
  playInstant(endedCallback?: () => void): void;
  stopInstant(): void;
  updatePlaybackRate(): void;
  cleanup(): void;
};

function createBeatActor(
  beatSource: BeatSourceItem,
  bus: SharedStateBus,
): BeatActor {
  let createAudioPromise: Promise<AudioItem> | undefined;
  let audioItem: AudioItem | undefined;
  let active = false;

  const calcPlaybackRate = () => bus.hostBpm / beatSource.originalBpm;

  const internal = {
    async ensureLoaded() {
      if (audioItem) return;
      createAudioPromise ??= createAudioItem(beatSource);
      audioItem = await createAudioPromise;
      // console.log(`loaded ${beatSource.id}`);
    },
    async play(startTimePosition?: number, endedCallback?: () => void) {
      await internal.ensureLoaded();
      if (!audioItem) return;
      if (startTimePosition !== undefined && (!active || !bus.hostPlaying)) {
        return;
      }
      const { audio, mediaElementSource } = audioItem;
      if (!audioItem.playing) {
        //initial start
        mediaElementSource.connect(audioDestinationNode);
        const playbackRate = calcPlaybackRate();
        audio.playbackRate = playbackRate;
        audio.currentTime = startTimePosition ?? 0;
        audio.play();
        audioItem.playing = true;
        if (endedCallback) {
          audio.addEventListener(
            "ended",
            () => {
              internal.stop();
              endedCallback();
            },
            { once: true },
          );
        }
      } else {
        //restart from the beginning
        audio.currentTime = 0;
        audio.play();
      }
    },
    stop() {
      if (audioItem?.playing) {
        const { audio, mediaElementSource } = audioItem;
        audio.pause();
        mediaElementSource.disconnect();
        audioItem.playing = false;
      }
    },
  };

  const self: BeatActor = {
    id: beatSource.id,
    preload() {
      void internal.ensureLoaded();
    },
    setBeatState(_active: boolean) {
      active = _active;
      if (bus.hostPlaying) {
        if (active) {
          const playbackRate = calcPlaybackRate();
          const startTimePosition = calculateStartTimePosition(
            bus.hostTimeAnchor,
            bus.hostBpm,
            beatSource.originalBpm,
            beatSource.barLength,
            playbackRate,
            audioContext.currentTime,
          );
          void internal.play(startTimePosition);
        } else {
          internal.stop();
        }
      } else {
        void internal.ensureLoaded();
      }
    },
    onHostStart() {
      // if (active) {
      //   void internal.play(false);
      // }
    },
    onHostStep(stepIndex: number, time: number) {
      const loopSteps = beatSource.barLength * 16;
      if (active && stepIndex % loopSteps === 0) {
        const delay = (time - audioContext.currentTime) * 1000;
        const forwardLeadingMs = 10;
        if (delay > forwardLeadingMs) {
          setTimeout(() => {
            if (!active || !bus.hostPlaying) return;
            void internal.play();
          }, delay - forwardLeadingMs);
        } else {
          void internal.play();
        }
      }
    },
    onHostStop() {
      if (active) {
        internal.stop();
      }
    },
    playInstant(endedCallback?: () => void) {
      void internal.play(undefined, endedCallback);
    },
    stopInstant() {
      internal.stop();
    },
    updatePlaybackRate() {
      if (audioItem) {
        const playbackRate = calcPlaybackRate();
        audioItem.audio.playbackRate = playbackRate;
      }
    },
    cleanup() {
      if (audioItem) {
        const { mediaElementSource, audio, audioBlobObjectURL } = audioItem;
        audio.pause();
        mediaElementSource.disconnect();
        URL.revokeObjectURL(audioBlobObjectURL);
        audioItem = undefined;
      }
    },
  };
  return self;
}

export function createLoopPlayerEngine(): LoopPlayerEngine {
  const bus: SharedStateBus = {
    hostPlaying: false,
    hostBpm: 120,
    hostTimeAnchor: undefined,
  };
  let beatActors: BeatActor[] = [];

  function getBeatActor(id: string): BeatActor | undefined {
    return beatActors.find((beatActor) => beatActor.id === id);
  }

  const self: LoopPlayerEngine = {
    unitInterface,
    registerBeatSourceItems(items) {
      self.cleanup();
      beatActors = items.map((item) => createBeatActor(item, bus));
    },
    preloadBeat(id) {
      const beatActor = getBeatActor(id);
      beatActor?.preload();
    },
    setBeatState(id, enabled) {
      const beatActor = getBeatActor(id);
      beatActor?.setBeatState(enabled);
    },
    playInstantBeat(id, endedCallback) {
      const beatActor = getBeatActor(id);
      beatActor?.playInstant(endedCallback);
    },
    stopInstantBeat(id) {
      const beatActor = getBeatActor(id);
      beatActor?.stopInstant();
    },
    setBpm(bpm: number) {
      bus.hostBpm = bpm;
      for (const beatActor of beatActors) {
        beatActor.updatePlaybackRate();
      }
    },
    clockHandlers: {
      start() {
        bus.hostPlaying = true;
        for (const beatActor of beatActors) {
          beatActor.onHostStart();
        }
      },
      processScheduling(timeFrom, barFrom, _barTo, bpm) {
        if (bpm !== bus.hostBpm) {
          self.setBpm(bpm);
        }
        bus.hostTimeAnchor = { time: timeFrom, transportBarPosition: barFrom };
      },
      processStep(stepIndex: number, time: number) {
        for (const beatActor of beatActors) {
          beatActor.onHostStep(stepIndex, time);
        }
      },
      stop() {
        bus.hostPlaying = false;
        for (const beatActor of beatActors) {
          beatActor.onHostStop();
        }
      },
    },
    cleanup() {
      for (const beatActor of beatActors) {
        beatActor.cleanup();
      }
      beatActors.length = 0;
    },
  };
  return self;
}
