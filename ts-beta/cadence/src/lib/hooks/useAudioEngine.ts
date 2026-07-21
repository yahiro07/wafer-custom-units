import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine, unitInterface } from "@/lib/audio/engine";
import type { EngineParams } from "@/lib/audio/types";
import { DEFAULT_ENGINE_PARAMS } from "@/lib/constants";

export interface UseAudioEngine {
  ready: boolean;
  params: EngineParams;
  noteOn: (id: string, frequency: number) => Promise<void>;
  noteOff: (id: string) => void;
  updateParams: (next: Partial<EngineParams>) => void;
  getAnalyser: () => AnalyserNode | null;
}

/**
 * Lazily constructs the AudioEngine on the first note (a user gesture, as the
 * autoplay policy requires), resumes the context, and exposes a small play API.
 * The engine is created once and reused; params are pushed onto live nodes.
 */
export function useAudioEngine(): UseAudioEngine {
  const engineRef = useRef<AudioEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [params, setParams] = useState<EngineParams>(DEFAULT_ENGINE_PARAMS);

  // Stable ref to the latest params so engine creation never uses stale values.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const ensureEngine = useCallback(async (): Promise<AudioEngine | null> => {
    if (!engineRef.current) {
      try {
        // Pass setParams so host persistence (applyStateBytes) can sync the UI.
        engineRef.current = new AudioEngine(paramsRef.current, setParams);
      } catch {
        return null;
      }
    }
    await engineRef.current.resume();
    setReady(true);
    return engineRef.current;
  }, []);

  const noteOn = useCallback(
    async (id: string, frequency: number): Promise<void> => {
      const engine = await ensureEngine();
      engine?.noteOn(id, frequency);
    },
    [ensureEngine],
  );

  const noteOff = useCallback((id: string): void => {
    engineRef.current?.noteOff(id);
  }, []);

  const updateParams = useCallback((next: Partial<EngineParams>): void => {
    setParams((prev) => {
      const merged = { ...prev, ...next };
      engineRef.current?.setParams(merged);
      return merged;
    });
  }, []);

  const getAnalyser = useCallback(
    (): AnalyserNode | null => engineRef.current?.getAnalyser() ?? null,
    [],
  );

  useEffect(() => {
    if (unitInterface) {
      void ensureEngine();
    }
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [ensureEngine]);

  return { ready, params, noteOn, noteOff, updateParams, getAnalyser };
}
