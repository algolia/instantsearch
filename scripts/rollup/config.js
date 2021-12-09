import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import semver from 'semver';

if (
  process.env.NODE_ENV === 'production' &&
  !semver.valid(process.env.VERSION)
) {
  throw new Error(
    `You need to specify a valid semver environment variable 'VERSION' to run the build process (received: ${JSON.stringify(
      process.env.VERSION
    )}).`
  );
}

const version =
  process.env.VERSION || `UNRELEASED (${new Date().toUTCString()})`;
const algolia = '© Algolia, Inc. and contributors; MIT License';
const link = 'https://github.com/algolia/instantsearch.js';
const license = `/*! InstantSearch.js ${version} | ${algolia} | ${link} */`;

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  }),
  babel({
    exclude: 'node_modules/**',
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
    banner: license,
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
