import type { ChangeEvent } from "react";
import type { EngineParams } from "@/lib/audio/types";
import { WAVEFORMS } from "@/lib/constants";

interface ControlsProps {
  params: EngineParams;
  updateParams: (next: Partial<EngineParams>) => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: SliderProps) {
  const handle = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value));
  };
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs font-medium text-foreground/60">
        <span className="uppercase tracking-wide">{label}</span>
        <span className="tabular-nums text-foreground/80">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handle}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-accent"
      />
    </label>
  );
}

/**
 * The synth control surface: waveform selector plus live sliders that reshape
 * the sound in real time. Every change is pushed straight onto the live audio
 * nodes via updateParams.
 */
export function Controls({ params, updateParams }: ControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {WAVEFORMS.map((wave) => {
          const selected = params.waveform === wave;
          return (
            <button
              key={wave}
              type="button"
              aria-pressed={selected}
              onClick={() => updateParams({ waveform: wave })}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                selected
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {wave}
            </button>
          );
        })}
      </div>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Slider
          label="Cutoff"
          value={params.cutoff}
          min={200}
          max={8000}
          step={10}
          display={`${Math.round(params.cutoff)} Hz`}
          onChange={(value) => updateParams({ cutoff: value })}
        />
        <Slider
          label="Resonance"
          value={params.resonance}
          min={0}
          max={20}
          step={0.1}
          display={params.resonance.toFixed(1)}
          onChange={(value) => updateParams({ resonance: value })}
        />
        <Slider
          label="Delay"
          value={params.delayFeedback}
          min={0}
          max={0.85}
          step={0.01}
          display={`${Math.round(params.delayFeedback * 100)}%`}
          onChange={(value) => updateParams({ delayFeedback: value })}
        />
        <Slider
          label="Attack"
          value={params.attack}
          min={0.001}
          max={1}
          step={0.001}
          display={`${Math.round(params.attack * 1000)} ms`}
          onChange={(value) => updateParams({ attack: value })}
        />
        <Slider
          label="Release"
          value={params.release}
          min={0.05}
          max={2}
          step={0.01}
          display={`${params.release.toFixed(2)} s`}
          onChange={(value) => updateParams({ release: value })}
        />
        <Slider
          label="Volume"
          value={params.volume}
          min={0}
          max={1}
          step={0.01}
          display={`${Math.round(params.volume * 100)}%`}
          onChange={(value) => updateParams({ volume: value })}
        />
      </div>
    </div>
  );
}
