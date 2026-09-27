import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "../../dist/sidechain-compressor", emptyOutDir: true },
  server: { port: 3000 },
});
