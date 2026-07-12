import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: { exclude: ["lucide-react"] },
  build: { outDir: "../dist/model-1", emptyOutDir: true },
});
