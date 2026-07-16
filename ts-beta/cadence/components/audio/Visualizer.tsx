"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/hooks/useTheme";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { drawVisualizer, type VizColors } from "@/lib/viz/draw";

interface VisualizerProps {
  getAnalyser: () => AnalyserNode | null;
  className?: string;
}

/**
 * Canvas wrapper that reads the engine's AnalyserNode and paints a live
 * spectrum + waveform. Performance guards: the rAF loop pauses when the canvas
 * scrolls off-screen (IntersectionObserver) or the tab hides (visibilitychange),
 * and device pixel ratio is capped. Honors prefers-reduced-motion with a calm
 * static frame.
 */
export function Visualizer({ getAnalyser, className }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let rafId: number | null = null;
    let visible = true;

    // Factory so the buffer element type is inferred (Uint8Array over a real
    // ArrayBuffer) rather than widened by an annotation — this keeps it
    // compatible with the analyser's getByte* signatures across TS versions.
    const makeBuffers = (node: AnalyserNode) => ({
      freq: new Uint8Array(node.frequencyBinCount),
      time: new Uint8Array(node.fftSize),
    });
    let buffers: ReturnType<typeof makeBuffers> | null = null;

    const colorsFor = (): VizColors =>
      themeRef.current === "dark"
        ? {
            barLow: "#fb7185",
            barMid: "#a855f7",
            barHigh: "#22d3ee",
            wave: "#22d3ee",
          }
        : {
            barLow: "#fb7185",
            barMid: "#a855f7",
            barHigh: "#7c3aed",
            wave: "#7c3aed",
          };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(Math.floor(canvas.clientWidth * dpr), 1);
      const h = Math.max(Math.floor(canvas.clientHeight * dpr), 1);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const drawIdle = () => {
      resize();
      const colors = colorsFor();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.wave;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      const analyser = getAnalyser();
      if (analyser) {
        if (!buffers || buffers.freq.length !== analyser.frequencyBinCount) {
          buffers = makeBuffers(analyser);
        }
        analyser.getByteFrequencyData(buffers.freq);
        analyser.getByteTimeDomainData(buffers.time);
        resize();
        drawVisualizer(
          ctx,
          buffers.freq,
          buffers.time,
          canvas.width,
          canvas.height,
          colorsFor(),
        );
      } else {
        drawIdle();
      }
      rafId = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (rafId === null && visible && !reducedMotion) {
        rafId = window.requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    if (reducedMotion) {
      drawIdle();
    } else {
      start();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        visible = entry.isIntersecting;
        if (visible && !document.hidden) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (visible && !reducedMotion) {
        start();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
    };
  }, [getAnalyser, reducedMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
