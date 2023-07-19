import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const clear = (x) => x.filter(Boolean);

const version = process.env.VERSION || 'UNRELEASED';
const algolia = '© Algolia, inc.';
const link = 'https://github.com/algolia/instantsearch.js';
const createBanner = () =>
  `/*! React InstantSearch ${version} | ${algolia} | ${link} */`;

const plugins = [
  babel({
    exclude: /node_modules|algoliasearch-helper/,
    extensions: ['.js', '.ts', '.tsx'],
    rootMode: 'upward',
    runtimeHelpers: true,
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  }),
  commonjs(),
  globals(),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  filesize({
    showMinifiedSize: false,
    showGzippedSize: true,
  }),
];

const createConfiguration = ({ input, name, minify = false } = {}) => ({
  input,
  external: ['react', 'react-dom'],
  output: {
    file: `dist/umd/${name}${minify ? '.min' : ''}.js`,
    name: `ReactInstantSearch.${name}`,
    format: 'umd',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    banner: createBanner(),
    sourcemap: true,
  },
  plugins: plugins.concat(
    clear([
      minify &&
        uglify({
          output: {
            preamble: createBanner(),
          },
        }),
    ])
  ),
});

export default [
  // Core
  createConfiguration({
    input: 'index.js',
    name: 'Core',
  }),
  createConfiguration({
    input: 'index.js',
    name: 'Core',
    minify: true,
  }),

  // DOM
  createConfiguration({
    input: 'dom.js',
    name: 'Dom',
  }),
  createConfiguration({
    input: 'dom.js',
    name: 'Dom',
    minify: true,
  }),

  // Connectors
  createConfiguration({
    input: 'connectors.js',
    name: 'Connectors',
  }),
  createConfiguration({
    input: 'connectors.js',
    name: 'Connectors',
    minify: true,
  }),
];
