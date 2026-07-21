import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  build: { outDir: "../../dist/jw-guitar-amp", emptyOutDir: true },
  server: { port: 3000 },
});
