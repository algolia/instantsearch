/**
 * Shared Rollup plugin configurations for InstantSearch packages.
 */

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

/**
 * Default extensions to resolve
 */
export const DEFAULT_EXTENSIONS = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'];

/**
 * Creates the node-resolve plugin with common settings.
 * @param {Object} [options] - Additional options to merge
 * @returns Configured nodeResolve plugin
 */
export function createResolvePlugin(options = {}) {
  return nodeResolve({
    browser: true,
    preferBuiltins: false,
    extensions: DEFAULT_EXTENSIONS,
    ...options,
  });
}

/**
 * Creates the Babel plugin with common settings.
 * @param {Object} [options] - Additional options to merge
 * @returns Configured babel plugin
 */
export function createBabelPlugin(options = {}) {
  return babel({
    babelHelpers: 'runtime',
    // Skip preflight check because files that don't need transforms
    // return 'inline' mode which causes a false error
    skipPreflightCheck: true,
    exclude: /node_modules|algoliasearch-helper/,
    extensions: ['.js', '.ts', '.tsx'],
    rootMode: 'upward',
    ...options,
  });
}

/**
 * Creates the commonjs plugin with common settings.
 * @param {Object} [options] - Additional options to merge
 * @returns Configured commonjs plugin
 */
export function createCommonjsPlugin(options = {}) {
  return commonjs(options);
}

/**
 * Creates the replace plugin for environment variables.
 * @param {Object} options
 * @param {'development' | 'production'} options.mode - Build mode
 * @param {Object} [options.additional] - Additional replacements
 * @returns Configured replace plugin
 */
export function createReplacePlugin({ mode, additional = {} }) {
  return replace({
    preventAssignment: true,
    __DEV__: mode === 'development',
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    ...additional,
  });
}

/**
 * Creates the terser plugin for minification.
 * @param {Object} [options]
 * @param {string} [options.banner] - License banner to preserve
 * @returns Configured terser plugin
 */
export function createTerserPlugin({
  banner,
  maxWorkers = 1,
  ...options
} = {}) {
  return terser({
    output: banner ? { preamble: banner } : undefined,
    maxWorkers,
    ...options,
  });
}

/**
 * Creates a plugin that emits a package.json file in the output directory.
 * @param {Object} content - Content of the package.json
 * @returns Rollup plugin
 */
export function createPackageJsonPlugin(content) {
  return {
    name: 'emit-package-json',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: JSON.stringify(content, null, 2),
      });
    },
  };
}

/**
 * Standard warning handler that throws on circular dependencies.
 * @param {Object} warning - Rollup warning object
 * @param {Function} warn - Default warn function
 */
export function onWarn(warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    throw new Error(warning.message);
  }
  warn(warning);
}
