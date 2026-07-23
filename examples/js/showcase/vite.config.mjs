import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs(), tailwindcss(), preact()],
  server: {
    // Proxy the local `structured-outputs` backend so the browser stays
    // same-origin (no CORS). Override the target with STRUCTURED_OUTPUTS_API.
    proxy: {
      '/agent-backend': {
        target: process.env.STRUCTURED_OUTPUTS_API || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agent-backend/, ''),
      },
    },
  },
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
