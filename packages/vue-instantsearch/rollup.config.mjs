import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import vue2PluginModule from 'rollup-plugin-vue2';
import vue3Plugin from 'rollup-plugin-vue3';

const vue2Plugin = vue2PluginModule.default || vue2PluginModule;

const processEnv = (mode) => ({
  preventAssignment: true,
  'process.env.NODE_ENV': JSON.stringify(mode),
});

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
    // Only handle relative imports that end with 'vue-compat' or 'vue-compat/Highlighter'
    // Don't handle .vue files or already resolved absolute paths
    if (
      source.includes('vue-compat') &&
      !source.endsWith('.vue') &&
      !path.isAbsolute(source) &&
      (source.endsWith('vue-compat') ||
        source.endsWith('vue-compat/Highlighter'))
    ) {
      const compatFolder = path.resolve(path.dirname(importer), source);
      const matchingVueCompatFile = `index-${vueVersion}.js`;
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
    commonjs(),
    json(),
    replace(processEnv('production')),
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
      replace({
        preventAssignment: true,
        'instantsearch.js/es': 'instantsearch.js/cjs',
      }),
      terser({ sourceMap: true }),
      createFile(
        'package.json',
        JSON.stringify({ type: 'commonjs', sideEffects: true })
      ),
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
      terser({ sourceMap: true }),
      createFile(
        'index.js',
        `import InstantSearch from './src/instantsearch.js';
export default InstantSearch;
export * from './src/instantsearch.js';`
      ),
      createFile(
        'package.json',
        JSON.stringify({ type: 'module', sideEffects: true })
      ),
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
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      terser({ sourceMap: true }),
    ],
  };

  if (isWatching) {
    return [esm];
  }

  return [cjs, esm, umd];
}

export default [...outputs('vue2'), ...(isWatching ? [] : outputs('vue3'))];
