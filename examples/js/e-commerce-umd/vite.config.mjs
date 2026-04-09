import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    commonjs(),
    legacy({
      targets: ['ie >= 11'],
    }),
  ],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
