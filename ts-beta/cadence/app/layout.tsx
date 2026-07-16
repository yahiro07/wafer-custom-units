import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import "./globals.css";

// next/font/google self-hosts these into the build output at build time:
// no runtime CDN request, no layout shift. It injects the CSS variables that
// globals.css and tailwind.config.ts reference.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "cadence — play sound in your browser",
  description:
    "A single-page audio-visual instrument built on the raw Web Audio API. A hand-wired synth you play by mouse or keyboard, driving a live canvas visualizer of real frequency and waveform data.",
  openGraph: {
    title: "cadence",
    description:
      "A hand-wired Web Audio synth and live canvas visualizer. Next.js, TypeScript, Tailwind.",
    type: "website",
  },
};

// Runs before first paint to set the theme class from storage or system
// preference, eliminating the dark/light flash on load.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("cadence-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${sora.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
