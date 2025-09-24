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
        background: resolve(__dirname, 'src/background/background.ts')
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          return 'assets/[name].js';
        }
      }
    }
  }
});
