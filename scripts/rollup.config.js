import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const version =
  process.env.VERSION || `UNRELEASED (${new Date().toUTCString()})`;
const algolia = '© Algolia, Inc. and contributors; MIT License';
const link = 'https://github.com/algolia/instantsearch.js';
const license = `/*! InstantSearch.js ${version} | ${algolia} | ${link} */`;

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  babel({
    exclude: 'node_modules/**',
    plugins: [
      'external-helpers',
      'transform-react-remove-prop-types',
      'transform-react-constant-elements',
      'transform-react-pure-class-to-function',
    ],
  }),
  commonjs(),
  globals(),
  filesize({
    showMinifiedSize: false,
    showGzippedSize: true,
  }),
];

const createConfiguration = ({ mode = 'production', minify = true } = {}) => ({
  input: 'index.js',
  output: {
    file: `dist/umd/instantsearch.${mode}${minify ? '.min' : ''}.js`,
    name: 'instantsearch',
    format: 'umd',
    banner: license,
    sourcemap: true,
  },
  plugins: [
    ...plugins,
    replace({
      __DEV__: mode === 'development',
    }),
    minify &&
      uglify({
        output: {
          preamble: license,
        },
      }),
  ].filter(Boolean),
});

export default [
  createConfiguration({
    mode: 'development',
    minify: false,
  }),
  createConfiguration({
    mode: 'production',
    minify: true,
  }),
];
