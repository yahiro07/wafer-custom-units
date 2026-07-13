import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    extensions: [".jsx", ".js"],
    alias: {
      "@": path.join(__dirname, "./src"),
    },
  },
  build: { outDir: "../dist/react-synth", emptyOutDir: true },
  server: { port: 3000 },
});
