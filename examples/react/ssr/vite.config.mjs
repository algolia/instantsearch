import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig(({ ssrBuild }) => {
  const isSSR = Boolean(ssrBuild);

  return {
    plugins: [commonjs(), react()],
    build: isSSR
      ? {
          outDir: 'dist',
          emptyOutDir: false,
          rollupOptions: {
            output: {
              entryFileNames: 'server.js',
              format: 'cjs',
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
  };
});
