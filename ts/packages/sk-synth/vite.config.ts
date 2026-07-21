import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "../../dist/sk-synth", emptyOutDir: true },
  server: { port: 3000 },
  legacy: {
    inconsistentCjsInterop: true,
  },
});
