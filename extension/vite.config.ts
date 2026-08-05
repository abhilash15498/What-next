import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Builds the three document-based surfaces of the extension. Background and
// content scripts are built separately (see vite.background.config.ts /
// vite.content.config.ts) because MV3 service workers and content scripts
// need single-file, non-code-split bundles — mixing that with a multi-page
// HTML app in one Rollup build is fragile, so we keep them apart on purpose.
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        newtab: resolve(__dirname, 'src/newtab/index.html'),
      },
    },
  },
});
