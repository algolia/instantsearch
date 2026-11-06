import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

import { handler } from './server/handler.mjs';

/**
 * Serves the fake backend from the Vite dev/preview server: one command.
 * Only in fake mode; Agent Studio mode talks to Algolia from the browser.
 */
function fakeBackend() {
  if (process.env.VITE_AGENTIC_BACKEND !== 'fake') return null;
  return {
    name: 'agentic-search-fake-backend',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [commonjs(), react(), fakeBackend()],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
