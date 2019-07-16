import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';

const processEnv = conf => ({
  // parenthesis to avoid syntax errors in places where {} is interpreted as a block
  'process.env': `(${JSON.stringify(conf)})`,
});

export default [
  {
    input: 'src/instantsearch.js',
    external: [
      'algoliasearch-helper',
      'instantsearch.js/es',
      'instantsearch.js/es/connectors',
      'vue',
    ],
    output: [
      {
        sourcemap: true,
        file: `dist/vue-instantsearch.common.js`,
        format: 'cjs',
        exports: 'named',
      },
      {
        sourcemap: true,
        file: `dist/vue-instantsearch.esm.js`,
        format: 'es',
      },
    ],
    plugins: [
      commonjs(),
      vue({ compileTemplate: true, css: false }),
      json(),
      buble({
        transforms: {
          dangerousForOf: true,
        },
      }),
      terser({
        sourcemap: true,
      }),
      filesize(),
    ],
  },
  {
    input: 'src/instantsearch.umd.js',
    external: ['vue'],
    output: [
      {
        sourcemap: true,
        file: `dist/vue-instantsearch.js`,
        format: 'umd',
        name: 'VueInstantSearch',
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    ],
    plugins: [
      vue({ compileTemplate: true, css: false }),
      json(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      buble({
        transforms: {
          dangerousForOf: true,
        },
      }),
      replace(processEnv({ NODE_ENV: 'production' })),
      commonjs(),
      terser({
        sourcemap: true,
      }),
      filesize(),
    ],
  },
];
