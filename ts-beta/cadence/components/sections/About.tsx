import { Reveal } from "@/components/motion/Reveal";

const stats = [
  { value: "4", label: "Oscillator waveforms" },
  { value: "8", label: "Voices of polyphony" },
  { value: "0", label: "Audio files or samples" },
  { value: "60", label: "FPS visualizer target" },
];

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            About
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Synthesized in your browser
          </h2>
          <p className="mt-6 text-foreground/70">
            Every sound you hear is generated live by a signal graph wired by
            hand: oscillators feed an amplitude envelope, then a low-pass
            filter, then a feedback delay, before reaching your speakers.
            Nothing is pre-recorded.
          </p>
          <p className="mt-4 text-foreground/70">
            The visualizer is not decoration &mdash; it reads the exact same
            audio through an analyser node, so the bars and waveform are a true
            picture of the sound leaving the engine.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6">
                <div className="font-display text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-foreground/60">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
