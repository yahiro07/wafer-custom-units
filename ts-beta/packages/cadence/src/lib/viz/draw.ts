/**
 * Pure canvas draw functions for the visualizer. Kept free of React and of the
 * audio engine so they are trivially testable and theme-reactive: the caller
 * passes resolved colors, these just paint.
 */

export interface VizColors {
  /** Three-stop gradient for the frequency bars (low -> mid -> high). */
  barLow: string;
  barMid: string;
  barHigh: string;
  /** Stroke for the time-domain waveform overlay. */
  wave: string;
}

/** Frequency-bar spectrum from AnalyserNode getByteFrequencyData. */
export function drawFrequencyBars(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  width: number,
  height: number,
  colors: VizColors,
): void {
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, colors.barLow);
  gradient.addColorStop(0.5, colors.barMid);
  gradient.addColorStop(1, colors.barHigh);
  ctx.fillStyle = gradient;

  // Use the lower ~70% of bins where musical energy lives; the top octaves are
  // mostly empty and would waste horizontal space.
  const usableBins = Math.floor(freq.length * 0.7);
  const barCount = Math.min(usableBins, 96);
  const step = usableBins / barCount;
  const gap = 2;
  const barWidth = width / barCount;

  for (let i = 0; i < barCount; i++) {
    const value = freq[Math.floor(i * step)] / 255; // 0..1
    const barHeight = value * height;
    const x = i * barWidth;
    ctx.fillRect(x, height - barHeight, Math.max(barWidth - gap, 1), barHeight);
  }
}

/** Time-domain waveform from AnalyserNode getByteTimeDomainData. */
export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  time: Uint8Array,
  width: number,
  height: number,
  color: string,
): void {
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.beginPath();

  const slice = width / time.length;
  for (let i = 0; i < time.length; i++) {
    const v = time[i] / 128; // 0..2, centered at 1
    const y = (v * height) / 2;
    const x = i * slice;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

/** Clear, then paint bars with the waveform overlaid. */
export function drawVisualizer(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  time: Uint8Array,
  width: number,
  height: number,
  colors: VizColors,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 0.85;
  drawFrequencyBars(ctx, freq, width, height, colors);
  ctx.globalAlpha = 1;
  drawWaveform(ctx, time, width, height, colors.wave);
}
