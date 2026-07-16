import { Navbar } from "@/components/nav/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Instrument } from "@/components/sections/Instrument";
import { About } from "@/components/sections/About";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/Footer";

/**
 * The entire site is one scroll: nav buttons smooth-scroll between these
 * sections, there is no client-side routing.
 */
export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Instrument />
      <About />
      <Features />
      <Footer />
    </main>
  );
}
