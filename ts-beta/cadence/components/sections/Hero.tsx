import { MagneticButton } from "@/components/motion/MagneticButton";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        className="spectrum-glow pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-5 inline-block rounded-full border border-foreground/15 bg-background/30 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-foreground/70 backdrop-blur-sm">
          Raw Web Audio API
        </p>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-7xl md:text-8xl">
          Sound, made
          <span className="block bg-gradient-to-r from-rose via-violet to-cyan bg-clip-text text-transparent">
            to be played
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
          A single-page instrument: a hand-wired synthesizer and a live
          visualizer of the sound you make, built on raw Web Audio &mdash; no
          libraries, no samples.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            href="#instrument"
            className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-background shadow-xl shadow-accent/20 transition-shadow hover:shadow-accent/40"
          >
            Start playing
          </MagneticButton>
          <MagneticButton
            href="#about"
            className="rounded-full border border-foreground/20 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/60"
          >
            How it works
          </MagneticButton>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-foreground/40">
        Scroll
      </div>
    </section>
  );
}
