# cadence

A single-page audio-visual instrument built on the **raw Web Audio API** — no Tone.js, no abstractions. A hand-wired synthesizer you play with mouse or keyboard, driving a live `<canvas>` visualizer that paints the real frequency and waveform data coming off the audio graph.

## Highlights

- **Hand-built synth engine** — a signal chain wired by hand: oscillators → ADSR envelopes → biquad filter → feedback delay → master gain → analyser → output. Every node is real Web Audio, not a library wrapper.
- **Polyphonic** — each note press spins up its own voice, so chords stack and release independently like a real instrument.
- **Live visualizer** — the canvas renders true `AnalyserNode` data: a frequency-bar spectrum and a time-domain waveform of the exact sound you are making.
- **Playable by keyboard or mouse** — home-row keys map to notes, and every pad is a real, labeled button, so the instrument is fully usable without a pointer.
- **Audio unlocked correctly** — the `AudioContext` is created and resumed on first user gesture, respecting browser autoplay policy.
- **Three performance guards** — the visualizer loop pauses when scrolled off-screen (IntersectionObserver) or when the tab is hidden (visibilitychange), and device pixel ratio is capped.
- **Accessibility first** — honors `prefers-reduced-motion` by calming the visualizer and disabling reveal animations.
- **Single-page, scroll-to-section** navigation with an active-link scroll spy, light/dark theming, magnetic buttons, and full responsive breakpoints.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · raw Web Audio API + Canvas 2D

## Project structure

| Path                       | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `web/app/`                 | App Router entry — layout, single-page composition, global styles |
| `web/components/sections/` | The scroll-to-section content blocks                              |
| `web/components/audio/`    | Visualizer canvas, keypad, and control surfaces                   |
| `web/lib/audio/`           | The synth engine, voices, note tables, and types                  |
| `web/lib/viz/`             | Pure, theme-aware canvas draw functions                           |
| `web/lib/hooks/`           | Audio-engine, scroll spy, theme, reduced-motion hooks             |

## Local development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click anywhere to start the audio engine.

## Scripts

| Command             | Action                        |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the dev server          |
| `npm run build`     | Production build              |
| `npm run lint`      | ESLint (next/core-web-vitals) |
| `npm run typecheck` | TypeScript, no emit           |

## Deployment

Deployed on **Vercel** with the project **Root Directory set to `web`**. No environment variables required — cadence is a fully client-rendered, pure-frontend experience.

## License

MIT — see [LICENSE](./LICENSE).
