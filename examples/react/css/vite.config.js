import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const _dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(_dirname, 'index.html'),
        products: resolve(_dirname, 'products/index.html'),
      },
    },
    commonjsOptions: {
      include: [/algoliasearch-helper/, /node_modules/],
    },
  },
  optimizeDeps: {
    include: ['algoliasearch-helper'],
  },
});
