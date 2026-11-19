import { fileURLToPath } from 'node:url';

import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^ember-instantsearch$/,
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
      /**
       * The full testutils entry imports Enzyme and React,
       * which the shared suites do not need.
       */
      {
        find: /^@instantsearch\/testutils$/,
        replacement: fileURLToPath(
          new URL('./tests/-support/testutils.ts', import.meta.url)
        ),
      },
      {
        find: /^@algolia\/requester-node-http$/,
        replacement: fileURLToPath(
          new URL('./tests/-support/requester.js', import.meta.url)
        ),
      },
    ],
  },
  optimizeDeps: {
    /**
     * Workspace packages are served as source,
     * so the CommonJS ones need a pre-bundle.
     *
     * `preact` is listed so that Vite does not find it in the middle
     * of a run and reload the tests.
     */
    include: [
      'preact',
      'algoliasearch-helper',
      'hogan.js',
      'qs',
      'algoliasearch-v3',
      'algoliasearch-v4',
      'algoliasearch-v5',
    ],
    esbuildOptions: {
      /**
       * The algoliasearch v3 browser build reads these at import time.
       */
      define: {
        'process.env.NODE_ENV': '"development"',
        'process.env.RESET_APP_DATA_TIMER': 'undefined',
      },
    },
  },
  define: {
    __DEV__: true,
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  plugins: [
    ember(),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
  test: {
    include: ['tests/**/*.test.{js,ts,gjs,gts}'],
    globals: true,
    setupFiles: ['./tests/-support/setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      /**
       * Playwright drives the Chrome that is installed on the machine,
       * so no browser download is needed locally or on CI.
       */
      provider: playwright({
        launchOptions: { channel: 'chrome' },
      }),
      instances: [{ browser: 'chromium' }],
      screenshotFailures: false,
    },
  },
});
