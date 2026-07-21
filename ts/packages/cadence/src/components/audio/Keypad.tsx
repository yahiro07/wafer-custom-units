import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { KEY_TO_MIDI, PADS, midiToFreq, type Pad } from "@/lib/audio/notes";

interface KeypadProps {
  noteOn: (id: string, frequency: number) => void | Promise<void>;
  noteOff: (id: string) => void;
}

const idFor = (midi: number) => `note-${midi}`;

/**
 * A playable one-octave keyboard. Pads respond to pointer and to the mapped
 * computer-keyboard keys; every pad is a real, labeled button so the
 * instrument is fully usable without a mouse.
 */
export function Keypad({ noteOn, noteOff }: KeypadProps) {
  const [active, setActive] = useState<ReadonlySet<string>>(new Set());

  // Refs keep the global key listeners pointed at the latest callbacks without
  // re-binding on every render.
  const noteOnRef = useRef(noteOn);
  noteOnRef.current = noteOn;
  const noteOffRef = useRef(noteOff);
  noteOffRef.current = noteOff;

  const press = (midi: number) => {
    const id = idFor(midi);
    setActive((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    void noteOnRef.current(id, midiToFreq(midi));
  };

  const lift = (midi: number) => {
    const id = idFor(midi);
    setActive((prev) => {
      if (!prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    noteOffRef.current(id);
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      const midi = KEY_TO_MIDI[event.key.toLowerCase()];
      if (midi !== undefined) {
        press(midi);
      }
    };
    const up = (event: KeyboardEvent) => {
      const midi = KEY_TO_MIDI[event.key.toLowerCase()];
      if (midi !== undefined) {
        lift(midi);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // press/lift are stable in behavior; listeners read latest via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whites = useMemo(() => PADS.filter((pad) => !pad.sharp), []);
  const blacks = useMemo(() => {
    const result: { pad: Pad; afterWhite: number }[] = [];
    let whiteIndex = -1;
    for (const pad of PADS) {
      if (pad.sharp) {
        result.push({ pad, afterWhite: whiteIndex });
      } else {
        whiteIndex += 1;
      }
    }
    return result;
  }, []);

  const onDown = (event: PointerEvent<HTMLButtonElement>, midi: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    press(midi);
  };

  return (
    <div className="relative mx-auto flex h-44 w-full max-w-2xl select-none touch-none sm:h-56">
      {whites.map((pad) => {
        const on = active.has(idFor(pad.midi));
        return (
          <button
            key={pad.note}
            type="button"
            aria-label={`Play ${pad.note}`}
            aria-pressed={on}
            onPointerDown={(event) => onDown(event, pad.midi)}
            onPointerUp={() => lift(pad.midi)}
            onPointerCancel={() => lift(pad.midi)}
            className={`relative flex flex-1 items-end justify-center rounded-b-xl border border-[#ddd] pb-3 text-xs font-medium transition-colors ${
              on
                ? "bg-accent text-background border-accent"
                : "bg-[#fff] text-[#ccc] hover:bg-[#eee]"
            }`}
          >
            <span className="pointer-events-none uppercase tracking-wide">
              {pad.key}
            </span>
          </button>
        );
      })}

      {blacks.map(({ pad, afterWhite }) => {
        const on = active.has(idFor(pad.midi));
        const left = ((afterWhite + 1) / whites.length) * 100;
        return (
          <button
            key={pad.note}
            type="button"
            aria-label={`Play ${pad.note}`}
            aria-pressed={on}
            onPointerDown={(event) => onDown(event, pad.midi)}
            onPointerUp={() => lift(pad.midi)}
            onPointerCancel={() => lift(pad.midi)}
            style={{
              left: `${left}%`,
              width: `${(100 / whites.length) * 0.62}%`,
            }}
            className={`absolute top-0 z-10 flex h-[62%] -translate-x-1/2 items-end justify-center rounded-b-lg border border-black/40 pb-2 text-[10px] font-medium transition-colors ${
              on
                ? "bg-accent text-background"
                : "bg-[#0a0b14] text-[#888] hover:bg-[#15182a]"
            }`}
          >
            <span className="pointer-events-none uppercase">{pad.key}</span>
          </button>
        );
      })}
    </div>
  );
}
