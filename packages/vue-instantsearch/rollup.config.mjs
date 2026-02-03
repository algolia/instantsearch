import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import {
  createCommonjsPlugin,
  createPackageJsonPlugin,
  createReplacePlugin,
  createResolvePlugin,
  createTerserPlugin,
} from '../../scripts/build/rollup.plugins.mjs';
import vue2PluginModule from 'rollup-plugin-vue2';
import vue3Plugin from 'rollup-plugin-vue3';

const vue2Plugin = vue2PluginModule.default || vue2PluginModule;

const createFile = (fileName, content) => ({
  name: 'inject-package-json',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName,
      source: content,
    });
  },
});

const aliasVueCompat = (vueVersion) => ({
  name: 'alias-vue-compat',
  resolveId(source, importer) {
    // Only intercept imports that:
    // 1. Contain 'vue-compat' in the path
    // 2. End with 'vue-compat' or 'vue-compat/Highlighter' (directory imports)
    // 3. Don't end with .vue (actual Vue component files)
    if (
      source.includes('vue-compat') &&
      !source.endsWith('.vue') &&
      (source.endsWith('vue-compat') ||
        source.endsWith('vue-compat/Highlighter') ||
        source.endsWith('vue-compat/index.js') ||
        source.endsWith('vue-compat/Highlighter/index.js'))
    ) {
      const matchingVueCompatFile = `./index-${vueVersion}.js`;

      const compatFolder = path.resolve(
        path.dirname(importer),
        // source is either './vue-compat', './vue-compat/index.js', etc.
        source.replace(/\/index\.js$/, '/')
      );

      return path.resolve(compatFolder, matchingVueCompatFile);
    }
    return null;
  },
});

const isWatching = process.env.ROLLUP_WATCH;

const external = (id) =>
  [
    'algoliasearch-helper',
    'instantsearch.js',
    'instantsearch-ui-components',
    'vue',
    'mitt',
  ].some((dep) => id === dep || id.startsWith(`${dep}/`));

function outputs(vueVersion) {
  const vuePlugin = vueVersion === 'vue3' ? vue3Plugin : vue2Plugin;

  const basePlugins = [
    vuePlugin({ compileTemplate: true, css: false }),
    createCommonjsPlugin(),
    json(),
    createReplacePlugin({ mode: 'production' }),
    aliasVueCompat(vueVersion),
  ];

  const cjs = {
    input: 'src/instantsearch.js',
    external,
    output: {
      sourcemap: true,
      file: `${vueVersion}/cjs/index.js`,
      format: 'cjs',
      exports: 'named',
    },
    plugins: [
      ...basePlugins,
      createReplacePlugin({
        mode: 'production',
        additional: {
          'instantsearch.js/es': 'instantsearch.js/cjs',
        },
      }),
      createTerserPlugin({ sourceMap: true }),
      createPackageJsonPlugin({ type: 'commonjs', sideEffects: true }),
    ],
  };

  const esm = {
    input: 'src/instantsearch.js',
    external,
    output: {
      sourcemap: true,
      dir: `${vueVersion}/es`,
      format: 'es',
      preserveModules: true,
    },
    plugins: [
      ...basePlugins,
      babel({
        babelHelpers: 'bundled',
        exclude: /node_modules|algoliasearch-helper/,
        extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue'],
        babelrc: false,
        plugins: [
          [
            require.resolve('../../scripts/babel/extension-resolver'),
            {
              modulesToResolve: ['instantsearch.js'],
            },
          ],
        ],
      }),
      createTerserPlugin({ sourceMap: true }),
      createFile(
        'index.js',
        `import InstantSearch from './src/instantsearch.js';
export default InstantSearch;
export * from './src/instantsearch.js';`
      ),
      createPackageJsonPlugin({ type: 'module', sideEffects: true }),
    ],
  };

  const umd = {
    input: 'src/instantsearch.umd.js',
    external: ['vue'],
    output: {
      sourcemap: true,
      file: `${vueVersion}/umd/index.js`,
      format: 'umd',
      name: 'VueInstantSearch',
      exports: 'named',
      globals: {
        vue: 'Vue',
      },
    },
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error(warning.message);
      }
      warn(warning);
    },
    plugins: [
      ...basePlugins,
      createResolvePlugin(),
      createTerserPlugin({ sourceMap: true }),
    ],
  };

  if (isWatching) {
    return [esm];
  }

  return [cjs, esm, umd];
}

export default [...outputs('vue2'), ...(isWatching ? [] : outputs('vue3'))];
