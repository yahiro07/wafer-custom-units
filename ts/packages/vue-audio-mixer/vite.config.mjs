import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      vue: resolve(__dirname, "node_modules/vue/dist/vue.esm.js"),
    },
  },
  server: { port: 3000 },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api", "import", "slash-div"],
      },
    },
  },
  build: {
    outDir: "../../dist/vue-audio-mixer",
    emptyOutDir: true,
    commonjsOptions: {
      include: [/src\/recorder\.js$/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
});
