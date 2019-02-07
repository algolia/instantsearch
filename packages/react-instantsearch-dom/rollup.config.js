import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const clear = x => x.filter(Boolean);

const version = process.env.VERSION || 'UNRELEASED';
const algolia = '© Algolia, inc.';
const link = 'https://github.com/algolia/react-instantsearch';
const createLicence = name =>
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
  input: 'src/index.js',
  external: ['react', 'react-dom'],
  output: {
    file: `dist/umd/ReactInstantSearch${name}${minify ? '.min' : ''}.js`,
    name: `ReactInstantSearch${name}`,
    format: 'umd',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    banner: createLicence(name),
    sourcemap: true,
  },
  plugins: plugins.concat(
    clear([
      minify &&
        uglify({
          output: {
            preamble: createLicence(name),
          },
        }),
    ])
  ),
});

export default [
  createConfiguration({
    name: 'DOM',
  }),

  createConfiguration({
    name: 'DOM',
    minify: true,
  }),
];
