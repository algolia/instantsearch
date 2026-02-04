/**
 * Shared Rollup configuration factories for InstantSearch packages.
 *
 * Usage in package rollup.config.mjs:
 *
 * import { createESMConfig, createCJSConfig, createUMDConfig } from '../../scripts/build/rollup.base.mjs';
 * import pkg from './package.json' with { type: 'json' };
 *
 * export default [
 *   createESMConfig({ input: 'src/index.ts', pkg }),
 *   createCJSConfig({ input: 'src/index.ts', pkg }),
 *   createUMDConfig({
 *     input: 'src/index.ts',
 *     pkg,
 *     name: 'MyGlobalName',
 *     banner: createBanner({ name: 'My Package', version: pkg.version }),
 *   }),
 * ];
 */

import {
  createSwcPlugin,
  createCommonjsPlugin,
  createPackageJsonPlugin,
  createReplacePlugin,
  createResolvePlugin,
  createStripJsxPragmaPlugin,
  createTerserPlugin,
  onWarn,
} from './rollup.plugins.mjs';
import { extensionResolver } from './rollup-plugin-extension-resolver.mjs';

/**
 * Creates an ESM (ES Modules) configuration.
 * @param {Object} options
 * @param {string} options.input - Entry point file
 * @param {Object} options.pkg - package.json contents
 * @param {string} [options.outputDir='dist/es'] - Output directory
 * @param {string[]} [options.external] - External dependencies (auto-detected from pkg if not provided)
 * @param {Object[]} [options.plugins] - Additional plugins to append
 * @param {boolean} [options.preserveModules=false] - Whether to preserve module structure
 * @returns Rollup configuration object
 */
export function createESMConfig({
  input,
  pkg,
  outputDir = 'dist/es',
  external,
  plugins = [],
  preserveModules = false,
}) {
  const externalDeps = external || getExternalDeps(pkg);

  return {
    input,
    external: externalDeps,
    output: {
      dir: outputDir,
      format: 'es',
      sourcemap: true,
      preserveModules,
      ...(preserveModules ? { preserveModulesRoot: 'src' } : {}),
    },
    onwarn: onWarn,
    plugins: [
      createResolvePlugin(),
      createCommonjsPlugin(),
      createSwcPlugin(),
      createReplacePlugin({ mode: 'production' }),
      createStripJsxPragmaPlugin(),
      extensionResolver({
        modulesToResolve: [
          'instantsearch.js',
          'react-dom',
          'use-sync-external-store',
          '@swc/helpers',
          'next',
        ],
      }),
      createPackageJsonPlugin({ type: 'module', sideEffects: false }),
      ...plugins,
    ],
  };
}

/**
 * Creates a CJS (CommonJS) configuration.
 * @param {Object} options
 * @param {string} options.input - Entry point file
 * @param {Object} options.pkg - package.json contents
 * @param {string} [options.outputDir='dist/cjs'] - Output directory
 * @param {string[]} [options.external] - External dependencies (auto-detected from pkg if not provided)
 * @param {Object[]} [options.plugins] - Additional plugins to append
 * @param {Object} [options.replaceImports] - Import path replacements (e.g., { 'pkg/es': 'pkg/cjs' })
 * @param {boolean} [options.preserveModules=false] - Whether to preserve module structure
 * @returns Rollup configuration object
 */
export function createCJSConfig({
  input,
  pkg,
  outputDir = 'dist/cjs',
  external,
  plugins = [],
  replaceImports = {},
  preserveModules = false,
}) {
  const externalDeps = external || getExternalDeps(pkg);

  return {
    input,
    external: externalDeps,
    output: {
      dir: outputDir,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      preserveModules,
      ...(preserveModules ? { preserveModulesRoot: 'src' } : {}),
    },
    onwarn: onWarn,
    plugins: [
      createResolvePlugin(),
      createCommonjsPlugin(),
      createSwcPlugin(),
      createReplacePlugin({ mode: 'production', additional: replaceImports }),
      createStripJsxPragmaPlugin(),
      createPackageJsonPlugin({ type: 'commonjs', sideEffects: false }),
      ...plugins,
    ],
  };
}

/**
 * Creates a UMD (Universal Module Definition) configuration for browser bundles.
 * Returns an array with both development and production (minified) builds.
 * @param {Object} options
 * @param {string} options.input - Entry point file
 * @param {Object} options.pkg - package.json contents
 * @param {string} options.name - UMD global variable name
 * @param {string} options.banner - License banner
 * @param {string} [options.outputDir='dist/umd'] - Output directory
 * @param {string} [options.fileName] - Base filename (defaults to lowercase name)
 * @param {Object} [options.globals={}] - External globals mapping (e.g., { react: 'React' })
 * @param {string[]} [options.external=[]] - External dependencies for UMD
 * @param {Object[]} [options.plugins] - Additional plugins to append
 * @returns Array of Rollup configuration objects [development, production]
 */
export function createUMDConfig({
  input,
  pkg,
  name,
  banner,
  outputDir = 'dist/umd',
  fileName,
  globals = {},
  external = [],
  plugins = [],
}) {
  const baseName = fileName || name.toLowerCase().replace(/\s+/g, '');

  const baseConfig = {
    input,
    external: Object.keys(globals).length > 0 ? Object.keys(globals) : external,
    onwarn: onWarn,
  };

  const basePlugins = [
    createResolvePlugin(),
    createCommonjsPlugin(),
    createSwcPlugin(),
  ];

  // Development build (unminified)
  const devConfig = {
    ...baseConfig,
    output: {
      file: `${outputDir}/${baseName}.development.js`,
      format: 'umd',
      name,
      globals,
      banner,
      sourcemap: true,
    },
    plugins: [
      ...basePlugins,
      createReplacePlugin({ mode: 'development' }),
      ...plugins,
    ],
  };

  // Production build (minified)
  const prodConfig = {
    ...baseConfig,
    output: {
      file: `${outputDir}/${baseName}.production.min.js`,
      format: 'umd',
      name,
      globals,
      banner,
      sourcemap: true,
    },
    plugins: [
      ...basePlugins,
      createReplacePlugin({ mode: 'production' }),
      createTerserPlugin({
        banner,
        compress: { passes: 3, toplevel: true },
        mangle: { toplevel: true, reserved: [name] },
      }),
      ...plugins,
    ],
  };

  return [devConfig, prodConfig];
}

/**
 * Extracts external dependencies from package.json.
 * Includes dependencies, peerDependencies, and optionalDependencies.
 * @param {Object} pkg - package.json contents
 * @returns {Function} External function for Rollup
 */
function getExternalDeps(pkg) {
  const deps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ];

  // Return a function that checks if an import is external
  // This handles subpath imports like 'lodash/merge'
  return (id) => {
    if (id.startsWith('.') || id.startsWith('/')) {
      return false;
    }
    return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
  };
}

/**
 * Re-export utilities for convenience
 */
export { createBanner } from './banner.mjs';
export {
  createSwcPlugin,
  createCommonjsPlugin,
  createPackageJsonPlugin,
  createReplacePlugin,
  createResolvePlugin,
  createStripJsxPragmaPlugin,
  createTerserPlugin,
  onWarn,
} from './rollup.plugins.mjs';
