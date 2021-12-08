import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

const clear = (x) => x.filter(Boolean);

const version = process.env.VERSION || 'UNRELEASED';
const algolia = '© Algolia, inc.';
const link = 'https://github.com/algolia/react-instantsearch';
const createBanner = (name) =>
  `/*! React InstantSearch${name} ${version} | ${algolia} | ${link} */`;

const plugins = [
  babel({
    exclude: ['../../node_modules/**', 'node_modules/**'],
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

const createConfiguration = ({ name, minify = false } = {}) => ({
  input: 'src/index.ts',
  external: ['react', 'react-dom', 'react-instantsearch-hooks'],
  output: {
    file: `dist/umd/ReactInstantSearch${name}${minify ? '.min' : ''}.js`,
    name: `ReactInstantSearch${name}`,
    format: 'umd',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'react-instantsearch-hooks': 'ReactInstantSearchHooks',
    },
    banner: createBanner(name),
    sourcemap: true,
  },
  plugins: plugins.concat(
    clear([
      minify &&
        uglify({
          output: {
            preamble: createBanner(name),
          },
        }),
    ])
  ),
});

export default [
  createConfiguration({
    name: 'HooksServer',
  }),

  createConfiguration({
    name: 'HooksServer',
    minify: true,
  }),
];
