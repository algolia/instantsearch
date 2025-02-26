import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products/index.html'),
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
