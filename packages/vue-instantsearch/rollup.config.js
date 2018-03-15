import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';

export default [
  {
    input: 'src/instantsearch.js',
    external: [
      'algoliasearch/lite',
      'algoliasearch-helper',
      'escape-html',
      'lodash/range',
      'instantsearch.js/es/',
      'instantsearch.js/es/connectors',
      'instantsearch.js/es/widgets/configure/configure.js',
    ],
    output: [
      {
        file: `dist/vue-instantsearch.common.js`,
        format: 'cjs',
        exports: 'named',
      },
      {
        file: `dist/vue-instantsearch.esm.js`,
        format: 'es',
      },
    ],
    plugins: [
      vue({ compileTemplate: true, css: false }),
      json(),
      buble({
        transforms: {
          dangerousForOf: true,
        },
      }),
      uglify(),
      filesize(),
    ],
  },
  {
    input: 'src/instantsearch.umd.js',
    output: [
      {
        file: `dist/vue-instantsearch.js`,
        format: 'umd',
        name: 'VueInstantSearch',
        exports: 'named',
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
      commonjs(),
      replace({
        'process.env': JSON.stringify({
          NODE_ENV: 'production',
        }),
      }),
      uglify(),
      filesize(),
    ],
  },
];
