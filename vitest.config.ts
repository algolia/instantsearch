import { readFileSync } from 'fs';

import vue2 from '@vitejs/plugin-vue2';
// @ts-expect-error -- v6 only ships .d.mts types, incompatible with moduleResolution "node"
import vue3 from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const algoliaSearchMajor: '3' | '4' | '5' =
  packageJson.devDependencies.algoliasearch.split('.')[0];

const isVue3 = process.env.VUE_VERSION === '3';

export default defineConfig({
  esbuild: {
    jsxDev: false,
  },
  oxc: {
    jsx: {
      development: false,
    },
  },
  plugins: [
    isVue3 ? vue3() : vue2(),
    {
      // Some .js files contain JSX with @jsx pragma (e.g., GeoSearchRenderer.js).
      // Vitest 4 uses rolldown which doesn't parse JSX in .js files by default.
      name: 'jsx-in-js',
      enforce: 'pre',
      async transform(code: string, id: string) {
        if (id.endsWith('.js') && code.includes('/** @jsx')) {
          const esbuild = await import('esbuild');
          const result = await esbuild.transform(code, {
            loader: 'jsx',
            jsx: 'transform',
            jsxFactory: 'h',
            sourcefile: id,
          });
          return { code: result.code, map: result.map };
        }
        return undefined;
      },
    },
  ],
  define: {
    __DEV__: true,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'preact'],
    alias: {
      'react-instantsearch':
        new URL('./packages/react-instantsearch/src/index.ts', import.meta.url)
          .pathname,
      'react-instantsearch-core/dist/es':
        new URL(
          './packages/react-instantsearch-core/src',
          import.meta.url
        ).pathname,
      'react-instantsearch-core':
        new URL(
          './packages/react-instantsearch-core/src/index.ts',
          import.meta.url
        ).pathname,
      'react-instantsearch-hooks$':
        new URL(
          './packages/react-instantsearch-hooks/src/',
          import.meta.url
        ).pathname,
      'react-instantsearch-hooks-web$':
        new URL(
          './packages/react-instantsearch-hooks-web/src/',
          import.meta.url
        ).pathname,
      'instantsearch.js$':
        new URL('./packages/instantsearch.js/src/', import.meta.url)
          .pathname,
      'instantsearch.js/es':
        new URL('./packages/instantsearch.js/src', import.meta.url)
          .pathname,
      'instantsearch.js/':
        new URL('./packages/instantsearch.js/', import.meta.url)
          .pathname,
      'instantsearch-ui-components$':
        new URL(
          './packages/instantsearch-ui-components/src/',
          import.meta.url
        ).pathname,
      'instantsearch-ui-components/':
        new URL(
          './packages/instantsearch-ui-components/',
          import.meta.url
        ).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    dangerouslyIgnoreUnhandledErrors: true,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    include: [
      '**/__tests__/**/*.{js,ts,tsx}',
      '**/*.{test,spec,-test,-spec}.{js,ts,tsx}',
    ],
    setupFiles: ['./tests/utils/setupTests.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist*/**',
      '**/tests/e2e/**',
      '**/examples/**',
      'packages/algoliasearch-helper/**',
      'packages/create-instantsearch-app/**',
      'packages/instantsearch-codemods/**',
      '**/scripts/transforms/__tests__/**',
      'packages/react-instantsearch-router-nextjs/__tests__/**',
      'packages/react-instantsearch-nextjs/__tests__/**',
      '**/__utils__/**',
      ...(algoliaSearchMajor !== '5'
        ? ['packages/algolia-experiences/**']
        : []),
    ],
    server: {
      deps: {
        inline: [
          /search-insights/,
          /algoliasearch/,
          /zod/,
          /@instantsearch/,
        ],
      },
    },
    pool: 'threads',
    snapshotFormat: {
      printBasicPrototype: false,
    },
    reporters: [
      'default',
      [
        'junit',
        {
          outputFile: 'junit/vitest/junit.xml',
          suiteName: 'InstantSearch Unit Tests',
          ancestorSeparator: ' › ',
        },
      ],
    ],
  },
});
