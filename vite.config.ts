import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        newtab: resolve(__dirname, 'src/newtab/newtab.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        offscreen: resolve(__dirname, 'public/offscreen.html')
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          if (chunk.name === 'offscreen') return 'offscreen.js';
          return 'assets/[name].js';
        }
      }
    }
  }
});
