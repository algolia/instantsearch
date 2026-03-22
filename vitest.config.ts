import { readFileSync } from 'fs';
import { createRequire } from 'module';

import vue2 from '@vitejs/plugin-vue2';
// @ts-expect-error -- v6 only ships .d.mts types, incompatible with moduleResolution "node"
import vue3 from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const algoliaSearchMajor: '3' | '4' | '5' =
  packageJson.devDependencies.algoliasearch.split('.')[0];

const isVue3 = process.env.VUE_VERSION === '3';
const vueInstantSearchRoot = new URL(
  './packages/vue-instantsearch/',
  import.meta.url
).pathname;
const vue3Compiler = isVue3
  ? require(
      require.resolve('@vue/compiler-sfc', {
        paths: [vueInstantSearchRoot],
      })
    )
  : undefined;
const vue3Runtime = isVue3
  ? require.resolve('vue', {
      paths: [vueInstantSearchRoot],
    })
  : undefined;
const vue3ServerRenderer = isVue3
  ? require.resolve('@vue/server-renderer', {
      paths: [vueInstantSearchRoot],
    })
  : undefined;

export default defineConfig({
  oxc: {
    jsx: {
      development: false,
    },
  },
  plugins: [
    isVue3 ? vue3({ compiler: vue3Compiler }) : vue2(),
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
    alias: [
      ...(isVue3
        ? [
            { find: /^vue$/, replacement: vue3Runtime! },
            {
              find: /^@vue\/server-renderer$/,
              replacement: vue3ServerRenderer!,
            },
          ]
        : []),
      {
        find: 'react-instantsearch',
        replacement: new URL(
          './packages/react-instantsearch/src/index.ts',
          import.meta.url
        ).pathname,
      },
      {
        find: 'react-instantsearch-core/dist/es',
        replacement: new URL(
          './packages/react-instantsearch-core/src',
          import.meta.url
        ).pathname,
      },
      {
        find: 'react-instantsearch-core',
        replacement: new URL(
          './packages/react-instantsearch-core/src/index.ts',
          import.meta.url
        ).pathname,
      },
      {
        find: /^react-instantsearch-hooks$/,
        replacement: new URL(
          './packages/react-instantsearch-hooks/src/',
          import.meta.url
        ).pathname,
      },
      {
        find: /^react-instantsearch-hooks-web$/,
        replacement: new URL(
          './packages/react-instantsearch-hooks-web/src/',
          import.meta.url
        ).pathname,
      },
      {
        find: /^instantsearch\.js$/,
        replacement: new URL('./packages/instantsearch.js/src/', import.meta.url)
          .pathname,
      },
      {
        find: 'instantsearch.js/es',
        replacement: new URL(
          './packages/instantsearch.js/src',
          import.meta.url
        ).pathname,
      },
      {
        find: 'instantsearch.js/',
        replacement: new URL('./packages/instantsearch.js/', import.meta.url)
          .pathname,
      },
      {
        find: /^instantsearch-ui-components$/,
        replacement: new URL(
          './packages/instantsearch-ui-components/src/',
          import.meta.url
        ).pathname,
      },
      {
        find: 'instantsearch-ui-components/',
        replacement: new URL(
          './packages/instantsearch-ui-components/',
          import.meta.url
        ).pathname,
      },
    ],
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
