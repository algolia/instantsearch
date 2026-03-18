import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

// Resolve to source files so we pick up the new v2 PoC files
// without needing to rebuild the packages.
const packages = resolve(__dirname, '..', '..', '..', 'packages');

export default defineConfig({
  plugins: [commonjs(), react()],
  resolve: {
    alias: {
      'react-instantsearch-core': resolve(
        packages,
        'react-instantsearch-core/src'
      ),
      'react-instantsearch': resolve(packages, 'react-instantsearch/src'),
      'instantsearch-ui-components': resolve(
        packages,
        'instantsearch-ui-components/src'
      ),
      'instantsearch.js/es': resolve(packages, 'instantsearch.js/src'),
      'instantsearch.js': resolve(packages, 'instantsearch.js/src'),
    },
  },
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
