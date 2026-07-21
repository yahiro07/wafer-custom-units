import { useAudioEngine } from "@/lib/hooks/useAudioEngine";
import { Visualizer } from "@/components/audio/Visualizer";
import { Keypad } from "@/components/audio/Keypad";
import { Controls } from "@/components/audio/Controls";
import { ThemeToggle } from "@/components/nav/ThemeToggle";

/**
 * The centerpiece. Owns the audio engine and composes the live visualizer, the
 * playable keypad, and the control surface into one instrument panel.
 */
export function Instrument() {
  const { ready, params, noteOn, noteOff, updateParams, getAnalyser } =
    useAudioEngine();

  return (
    <section id="instrument" className="relative w-[940px]">
      <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-8 backdrop-blur-sm pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-2xl font-bold tracking-tight text-foreground">
            cadence<span className="text-accent">.</span>
          </div>
          <ThemeToggle />
        </div>

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
