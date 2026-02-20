import { resolve } from 'path';

import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs()],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        local: resolve(__dirname, 'local.html'),
        toggle: resolve(__dirname, 'toggle.html'),
      },
    },
  },
});
