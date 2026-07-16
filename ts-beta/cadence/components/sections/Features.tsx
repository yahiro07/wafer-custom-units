import { Reveal } from "@/components/motion/Reveal";

const features = [
  {
    title: "Hand-wired signal graph",
    body: "Oscillators, ADSR envelope, biquad filter, and a feedback delay line connected by hand on raw Web Audio nodes. No Tone.js, no wrappers.",
  },
  {
    title: "Polyphonic voices",
    body: "Each key press spins up its own voice, so chords stack and release independently instead of choking a single oscillator.",
  },
  {
    title: "True analyser visualizer",
    body: "The canvas paints real getByteFrequencyData and getByteTimeDomainData from an analyser tap, not a faked animation.",
  },
  {
    title: "Play by keyboard or mouse",
    body: "Home-row and upper-row keys map to a chromatic octave; every pad is a labeled button, so it is playable without a pointer.",
  },
  {
    title: "Autoplay-policy correct",
    body: "The audio context is created and resumed on your first gesture, exactly as browsers require, with a graceful webkit fallback.",
  },
  {
    title: "Accessible and efficient",
    body: "Honors reduced-motion, and the visualizer loop pauses off-screen and on hidden tabs so a background instrument never pins the CPU.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-32">
      <Reveal>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">
          Features
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Engineered like an instrument, not a toy
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 3) * 0.08}>
            <article className="group h-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-7 transition-colors hover:border-accent/40">
              <div className="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-rose via-violet to-cyan transition-all group-hover:w-16" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                {feature.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
