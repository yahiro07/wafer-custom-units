import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  base: "./",
  plugins: [vue()],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@scss": path.resolve(__dirname, "src/assets/scss"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["import"],
        additionalData(content, filename) {
          if (filename.includes(`${path.sep}src${path.sep}assets${path.sep}scss${path.sep}`)) {
            return content;
          }

          return `@import "@/assets/scss/global.scss";\n${content}`;
        },
      },
    },
  },
  build: { outDir: "../dist/vue-synth", emptyOutDir: true },
  server: { port: 3000 },
};
