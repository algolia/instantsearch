/**
 * Shared Rollup plugin configurations for InstantSearch packages.
 */

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import swc from 'rollup-plugin-swc3';

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
 * Creates the SWC plugin with common settings.
 * @param {Object} [options] - Additional options to merge
 * @param {Object} [options.jsc] - SWC jsc options to merge
 * @param {Object} [options.env] - SWC env options to merge
 * @returns Configured swc plugin
 */
export function createSwcPlugin(options = {}) {
  const { jsc: jscOverrides = {}, env: envOverrides = {}, ...restOptions } = options;
  
  return swc({
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    tsconfig: false,
    sourceMaps: true,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
      transform: {
        react: {
          runtime: 'classic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
        },
      },
      externalHelpers: true,
      ...jscOverrides,
    },
    env: {
      targets: 'ie >= 11',
      // Don't inject polyfills - let consumers handle that
      ...envOverrides,
    },
    ...restOptions,
  });
}

/**
 * Creates a plugin that strips JSX pragma comments from output.
 * This prevents conflicts with bundlers using automatic JSX runtime.
 * @returns Rollup plugin
 */
export function createStripJsxPragmaPlugin() {
  return {
    name: 'strip-jsx-pragma',
    renderChunk(code) {
      // Remove /** @jsx ... */ and /** @jsxFrag ... */ comments
      const transformed = code.replace(/\/\*\*?\s*@jsx\w*\s+[^*]*\*\//g, '');
      if (transformed !== code) {
        return { code: transformed, map: null };
      }
      return null;
    },
  };
}

/**
 * Creates the commonjs plugin with common settings.
 * @param {Object} [options] - Additional options to merge
 * @returns Configured commonjs plugin
 */
export function createCommonjsPlugin(options = {}) {
  const { include, extensions, ...restOptions } = options;

  return commonjs({
    include: include || [/node_modules/, /packages\/algoliasearch-helper\//],
    extensions: extensions || ['.js', '.cjs'],
    transformMixedEsModules: true,
    ...restOptions,
  });
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
