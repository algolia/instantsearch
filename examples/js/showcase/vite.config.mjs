import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs(), tailwindcss(), preact()],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
