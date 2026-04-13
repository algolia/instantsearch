import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    commonjs(),
    legacy({
      targets: ['defaults', 'IE 11'],
    }),
  ],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
