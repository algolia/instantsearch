import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs(), react()],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
