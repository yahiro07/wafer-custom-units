import { Persistence } from "wafer-host/unit-types";
import { setParameters, store } from "./store";

const STATE_BYTE_LENGTH = 8;

function toByte(value: number, min: number, max: number): number {
  const normalized = (value - min) / (max - min);
  return Math.round(Math.min(1, Math.max(0, normalized)) * 255);
}

function fromByte(byte: number, min: number, max: number): number {
  return min + (byte / 255) * (max - min);
}

export const persistence: Persistence = {
  emitStateBytes(): Uint8Array {
    const { compressor } = store.getState();
    return new Uint8Array([
      compressor.sidechain ? 1 : 0,
      compressor.bypass ? 1 : 0,
      toByte(compressor.threshold, -79, 0),
      toByte(compressor.ratio, 1, 20),
      toByte(compressor.attack, 0.001, 0.08),
      toByte(compressor.release, 0.001, 0.08),
      toByte(compressor.mix, 0, 1),
      toByte(compressor.gain, 0, 24),
    ]);
  },
  applyStateBytes(bytes) {
    if (bytes.length !== STATE_BYTE_LENGTH) return;
    store.dispatch(
      setParameters({
        sidechain: bytes[0] !== 0,
        bypass: bytes[1] !== 0,
        threshold: fromByte(bytes[2], -79, 0),
        ratio: fromByte(bytes[3], 1, 20),
        attack: fromByte(bytes[4], 0.001, 0.08),
        release: fromByte(bytes[5], 0.001, 0.08),
        mix: fromByte(bytes[6], 0, 1),
        gain: fromByte(bytes[7], 0, 24),
      }),
    );
  },
};
