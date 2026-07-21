import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { outDir: '../../dist/super-oscillator', emptyOutDir: true },
  server: { port: 3000 },
});
