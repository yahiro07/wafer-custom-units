"use client";

import { useAudioEngine } from "@/lib/hooks/useAudioEngine";
import { Visualizer } from "@/components/audio/Visualizer";
import { Keypad } from "@/components/audio/Keypad";
import { Controls } from "@/components/audio/Controls";

/**
 * The centerpiece. Owns the audio engine and composes the live visualizer, the
 * playable keypad, and the control surface into one instrument panel.
 */
export function Instrument() {
  const { ready, params, noteOn, noteOff, updateParams, getAnalyser } =
    useAudioEngine();

  return (
    <section id="instrument" className="relative mx-auto max-w-5xl px-6 py-32">
      <div className="mb-10 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">
          Play
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Make some noise
        </h2>
        <p className="mx-auto mt-4 max-w-md text-foreground/65">
          Click the keys or use your keyboard. Shape the sound with the controls
          and watch the waveform respond in real time.
        </p>
      </div>

      <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-5 backdrop-blur-sm sm:p-8">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40">
          <Visualizer
            getAnalyser={getAnalyser}
            className="block h-40 w-full sm:h-48"
          />
          {!ready && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-foreground/15 bg-background/70 px-4 py-1.5 text-xs font-medium text-foreground/70 backdrop-blur-sm">
                Press a key to start the audio engine
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Keypad noteOn={noteOn} noteOff={noteOff} />
        </div>

        <div className="mt-8 border-t border-foreground/10 pt-6">
          <Controls params={params} updateParams={updateParams} />
        </div>
      </div>
    </section>
  );
}
