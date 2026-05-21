import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: isSsrBuild
    ? {
        outDir: 'dist',
        emptyOutDir: false,
        rollupOptions: {
          output: {
            entryFileNames: 'server.js',
            format: 'esm',
          },
        },
      }
    : {
        outDir: 'dist',
        rollupOptions: {
          input: 'src/browser.jsx',
          output: {
            entryFileNames: 'assets/bundle.js',
          },
        },
      },
}));
