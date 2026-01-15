import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

import packageJson from '../../package.json';

const version =
  process.env.NODE_ENV === 'production'
    ? packageJson.version
    : `UNRELEASED (${new Date().toUTCString()})`;
const algolia = '© Algolia, Inc. and contributors; MIT License';
const link = 'https://github.com/algolia/instantsearch';
const license = `/*! InstantSearch.js ${version} | ${algolia} | ${link} */`;

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  }),
  babel({
    rootMode: 'upward',
    runtimeHelpers: true,
    exclude: /node_modules|algoliasearch-helper/,
    extensions: ['.js', '.ts', '.tsx'],
  }),
  commonjs(),
  filesize({
    showMinifiedSize: false,
    showGzippedSize: true,
  }),
];

const createConfiguration = ({ mode, filename }) => ({
  input: 'src/index.ts',
  output: {
    file: `dist/${filename}`,
    name: 'instantsearch',
    format: 'umd',
    banner: `${license}\n(function(){if(typeof TransformStream==='undefined'){var g=typeof window!=='undefined'?window:this;g.TransformStream=function(){};g.TransformStream.prototype={readable:null,writable:null};}})();`,
    sourcemap: true,
  },
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY')
      throw new Error(warning.message);

    warn(warning);
  },
  plugins: [
    ...plugins,
    replace({
      __DEV__: mode === 'development',
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    mode === 'production' &&
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
    filename: 'instantsearch.development.js',
  }),
  createConfiguration({
    mode: 'production',
    filename: 'instantsearch.production.min.js',
  }),
];
