/**
 * Shared Rollup plugin configurations for InstantSearch packages.
 */

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import swc from 'rollup-plugin-swc3';
import MagicString from 'magic-string';

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
 * Creates a plugin that wraps warn/warning calls in __DEV__ checks.
 * This allows production builds to strip warnings.
 * @returns Rollup plugin
 */
export function createWrapWarningsWithDevCheckPlugin() {
  const WARNING_IDENTIFIERS = new Set(['warn', 'warning']);
  const DEV_IDENTIFIER = '__DEV__';

  function walk(node, callback) {
    if (!node || typeof node !== 'object') return;
    callback(node);
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => walk(c, callback));
      } else if (child && typeof child.type === 'string') {
        walk(child, callback);
      }
    }
  }

  return {
    name: 'wrap-warning-with-dev-check',
    transform(code, id) {
      if (!id || id.includes('node_modules')) {
        return null;
      }

      if (!/\bwarn\s*\(|\bwarning\s*\(/.test(code)) {
        return null;
      }

      let ast;
      try {
        ast = this.parse(code);
      } catch {
        return null;
      }

      const magicString = new MagicString(code);
      let hasChanges = false;

      walk(ast, (node) => {
        if (
          node.type === 'ExpressionStatement' &&
          node.expression.type === 'CallExpression' &&
          node.expression.callee.type === 'Identifier' &&
          WARNING_IDENTIFIERS.has(node.expression.callee.name)
        ) {
          magicString.appendLeft(node.start, `if (${DEV_IDENTIFIER}) { `);
          magicString.appendRight(node.end, ` }`);
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        return null;
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
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
 * Creates a pair of plugins that work around an SWC bug where the JSX pragma
 * name collides with a local variable of the same name.
 *
 * When a file has `/** @jsx createElement * /` and also destructures
 * `{ createElement }` from a parameter, SWC renames the local variable
 * (e.g., to `createElement1`) but still generates JSX calls using the bare
 * pragma name `createElement`, which is then undefined at runtime.
 *
 * The workaround:
 * 1. `prePlugin` strips `@jsx`/`@jsxFrag` pragmas from source BEFORE SWC,
 *    so SWC uses its default `React.createElement` pragma (no collision).
 * 2. `postPlugin` replaces `React.createElement(` back to the original pragma
 *    name (e.g., `createElement(`) AFTER SWC, restoring the intended behavior.
 *
 * Usage:
 *   const { prePlugin, postPlugin } = createJsxPragmaFixPlugins();
 *   // prePlugin must be positioned BEFORE the SWC plugin
 *   // postPlugin must be positioned AFTER the SWC plugin
 *
 * @returns {{ prePlugin: import('rollup').Plugin, postPlugin: import('rollup').Plugin }}
 */
export function createJsxPragmaFixPlugins() {
  const pragmaInfo = new Map();

  const prePlugin = {
    name: 'jsx-pragma-fix-pre',
    transform(code, id) {
      if (!/\.[jt]sx$/.test(id)) return null;

      const jsxMatch = code.match(/\/\*\*?\s*@jsx\s+(\w+)\s*\*\//);
      if (!jsxMatch) return null;

      const pragma = jsxMatch[1];
      const jsxFragMatch = code.match(/\/\*\*?\s*@jsxFrag\s+(\w+)\s*\*\//);
      const pragmaFrag = jsxFragMatch ? jsxFragMatch[1] : 'Fragment';

      pragmaInfo.set(id, { pragma, pragmaFrag });

      // Strip @jsx and @jsxFrag pragma comments so SWC uses its default
      // React.createElement / React.Fragment (avoiding the naming collision)
      const stripped = code.replace(/\/\*\*?\s*@jsx\w*\s+[^*]*\*\//g, '');
      if (stripped !== code) {
        return { code: stripped, map: null };
      }
      return null;
    },
  };

  const postPlugin = {
    name: 'jsx-pragma-fix-post',
    transform(code, id) {
      const info = pragmaInfo.get(id);
      if (!info) return null;

      let result = code;
      result = result.replace(/React\.createElement\s*\(/g, `${info.pragma}(`);
      result = result.replace(/React\.Fragment/g, info.pragmaFrag);

      if (result !== code) {
        return { code: result, map: null };
      }
      return null;
    },
  };

  return { prePlugin, postPlugin };
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
