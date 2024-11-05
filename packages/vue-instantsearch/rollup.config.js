import path from 'path';

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import vueV2 from 'rollup-plugin-vue2';
import vueV3 from 'rollup-plugin-vue3';

const processEnv = (conf) => ({
  // parenthesis to avoid syntax errors in places where {} is interpreted as a block
  'process.env': `(${JSON.stringify(conf)})`,
});

const createFile = (fileName, content) => ({
  name: 'inject-package-json',
  buildEnd() {
    this.emitFile({
      type: 'asset',
      fileName,
      source: content,
    });
  },
});

const aliasVueCompat = (vueVersion) => ({
  name: 'alias-vue-compat',
  resolveId(source, fileName) {
    if (source.includes('vue-compat')) {
      const matchingVueCompatFile = `./index-${vueVersion}.js`;

      const compatFolder = path.resolve(
        path.dirname(fileName),
        // source is either './vue-compat' or './vue-compat/index.js'
        source.replace(/\/index\.js$/, '/')
      );

      return path.resolve(compatFolder, matchingVueCompatFile);
    }
    return null;
  },
});

const isWatching = process.env.ROLLUP_WATCH;

function outputs(vueVersion) {
  const vuePlugin = vueVersion === 'vue3' ? vueV3 : vueV2;

  const plugins = [
    vuePlugin({ compileTemplate: true, css: false }),
    babel({
      exclude: /node_modules|algoliasearch-helper/,
      extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue'],
      rootMode: 'upward',
      runtimeHelpers: true,
      plugins: [
        [
          require('../../scripts/babel/extension-resolver'),
          {
            // For verification, see test/module/packages-are-es-modules.mjs
            modulesToResolve: [
              // InstantSearch.js/es is an ES Module, so needs complete paths,
              'instantsearch.js',
            ],
          },
        ],
      ],
    }),
    commonjs(),
    json(),
    replace(processEnv({ NODE_ENV: 'production' })),
    aliasVueCompat(vueVersion),
    terser({
      sourcemap: true,
    }),
  ];

  const external = (id) =>
    [
      'algoliasearch-helper',
      'instantsearch.js',
      'instantsearch-ui-components',
      'vue',
      'mitt',
    ].some((dep) => id === dep || id.startsWith(`${dep}/`));

  const cjs = {
    input: 'src/instantsearch.js',
    external,
    output: [
      {
        sourcemap: true,
        file: `${vueVersion}/cjs/index.js`,
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins: [
      ...plugins,
      replace({
        'instantsearch.js/es': 'instantsearch.js/cjs',
      }),
      createFile(
        'package.json',
        JSON.stringify({ type: 'commonjs', sideEffects: true })
      ),
    ],
  };

  const esm = {
    input: 'src/instantsearch.js',
    external,
    output: [
      {
        sourcemap: true,
        dir: `${vueVersion}/es`,
        format: 'es',
      },
    ],
    preserveModules: true,
    plugins: [
      ...plugins,
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
    output: [
      {
        sourcemap: true,
        file: `${vueVersion}/umd/index.js`,
        format: 'umd',
        name: 'VueInstantSearch',
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    ],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY')
        throw new Error(warning.message);

      warn(warning);
    },
    plugins: [
      ...plugins,
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      filesize(),
    ],
  };

  if (isWatching) {
    return [esm];
  }

  return [cjs, esm, umd];
}

export default [...outputs('vue2'), ...(isWatching ? [] : outputs('vue3'))];
