import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: { outDir: "../../dist/hm-step-sequencer", emptyOutDir: true },
  server: { port: 3000 },
});
