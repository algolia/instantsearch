import path from 'path';
import { fileURLToPath } from 'url';

import json from '@rollup/plugin-json';
import {
  createCommonjsPlugin,
  createPackageJsonPlugin,
  createReplacePlugin,
  createResolvePlugin,
  createStripJsxPragmaPlugin,
  createSwcPlugin,
  createTerserPlugin,
} from '../../scripts/build/rollup.plugins.mjs';
import { extensionResolver } from '../../scripts/build/rollup-plugin-extension-resolver.mjs';
import vue2PluginModule from 'rollup-plugin-vue2';
import vue3Plugin from 'rollup-plugin-vue3';

const vue2Plugin = vue2PluginModule.default || vue2PluginModule;
const packageRoot = path.dirname(fileURLToPath(import.meta.url));

const createFile = (fileName, content) => ({
  name: 'inject-package-json',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName,
      source: content,
    });
  },
});

const aliasVueCompat = vueVersion => ({
  name: 'alias-vue-compat',
  resolveId(source, importer) {
    // Only intercept imports that:
    // 1. Contain 'vue-compat' in the path
    // 2. End with 'vue-compat' or 'vue-compat/Highlighter' (directory imports)
    // 3. Don't end with .vue (actual Vue component files)
    if (
      source.includes('vue-compat') &&
      !source.endsWith('.vue') &&
      (source.endsWith('vue-compat') ||
        source.endsWith('vue-compat/Highlighter') ||
        source.endsWith('vue-compat/index.js') ||
        source.endsWith('vue-compat/Highlighter/index.js'))
    ) {
      const matchingVueCompatFile = `./index-${vueVersion}.js`;

      const compatFolder = path.resolve(
        path.dirname(importer),
        // source is either './vue-compat', './vue-compat/index.js', etc.
        source.replace(/\/index\.js$/, '/')
      );

      return path.resolve(compatFolder, matchingVueCompatFile);
    }
    return null;
  },
});

const isWatching = process.env.ROLLUP_WATCH;

/**
 * For the vue3 ESM build, rollup-plugin-vue@6 emits three files per .vue source:
 *   Panel.vue2.js  – component options object (no render function)
 *   Panel.vue3.js  – render function only
 *   Panel.vue.js   – bridge: imports both, attaches render, re-exports
 *
 * The entry chunks (instantsearch.js, widgets.js) end up exporting from
 * .vue2.js (no render) while relying on bare side-effect `import "…vue.js"`
 * lines to attach the render. Bundlers that honour `sideEffects: false` (e.g.
 * Vite 8 / Rolldown) tree-shake those bare imports away, leaving all widgets
 * with no render function.
 *
 * This plugin post-processes every generated chunk (after minification) to:
 *   0. Rewrite bridge modules to compose a new object instead of mutating the
 *      imported component (mutation gets discarded by some bundlers).
 *   1. Remove bare side-effect imports of bridge files.
 *   2. Redirect every .vue2.js export to the .vue.js bridge, making each
 *      export self-contained and side-effect-free.
 */
const fixVue3SfcExports = () => ({
  name: 'fix-vue3-sfc-exports',
  generateBundle(_, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== 'chunk') continue;

      if (chunk.fileName.endsWith('.vue.js')) {
        const bridgePattern = /import\s+(\w+)\s+from"([^"]*\.vue2\.js)";import{render as (\w+)}from"([^"]*\.vue3\.js)";([^]*)export{(\w+)\s+as\s+default};/;

        const match = chunk.code.match(bridgePattern);

        if (match) {
          const [
            ,
            component,
            vue2Path,
            renderAlias,
            vue3Path,
            assignmentBlock,
          ] = match;
          const extraProps = [];

          const fileMatch = assignmentBlock.match(/__file\s*=\s*([^,;]+)/);
          if (fileMatch) {
            extraProps.push(`__file:${fileMatch[1].trim()}`);
          }

          const scopeMatch = assignmentBlock.match(/__scopeId\s*=\s*([^,;]+)/);
          if (scopeMatch) {
            extraProps.push(`__scopeId:${scopeMatch[1].trim()}`);
          }

          const extraPropsString = extraProps.length
            ? `,${extraProps.join(',')}`
            : '';

          chunk.code = `import ${component} from"${vue2Path}";import{render as ${renderAlias}}from"${vue3Path}";export default {...${component},render:${renderAlias}${extraPropsString}};`;
        }

        continue;
      }

      let { code } = chunk;

      // 1. Remove bare side-effect imports of .vue.js bridge files
      //    Handles both minified (`import"…";`) and non-minified (`import "…";`)
      code = code.replace(/\bimport\s*"([^"]*\.vue)\.js"\s*;?\s*/g, '');

      // 2. Redirect .vue2.js re-exports to the .vue.js bridge
      code = code.replace(/\bfrom\s*"([^"]*\.vue)2\.js"/g, 'from"$1.js"');

      chunk.code = code;
    }
  },
});

const external = id =>
  [
    'algoliasearch-helper',
    'instantsearch.js',
    'instantsearch-core',
    'instantsearch-ui-components',
    'vue',
    'mitt',
    '@swc/helpers',
  ].some(dep => id === dep || id.startsWith(`${dep}/`));

function outputs(vueVersion) {
  const vuePlugin = vueVersion === 'vue3' ? vue3Plugin : vue2Plugin;

  const basePlugins = [
    aliasVueCompat(vueVersion),
    vuePlugin({ compileTemplate: true, css: false }),
    createCommonjsPlugin(),
    createSwcPlugin({
      include: /\.[jt]sx?$|\.vue$/,
    }),
    createResolvePlugin({
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.vue'],
    }),
    json(),
    createReplacePlugin({ mode: 'production' }),
    createStripJsxPragmaPlugin(),
  ];

  const cjs = {
    input: 'src/instantsearch.js',
    external,
    output: {
      sourcemap: false,
      file: `${vueVersion}/cjs/index.js`,
      format: 'cjs',
      exports: 'named',
    },
    plugins: [
      ...basePlugins,
      createReplacePlugin({
        mode: 'production',
        additional: {
          'instantsearch.js/es': 'instantsearch.js/cjs',
        },
      }),
      createTerserPlugin({ sourceMap: false }),
      createPackageJsonPlugin({ type: 'commonjs', sideEffects: true }),
    ],
  };

  const esm = {
    input: 'src/instantsearch.js',
    external,
    output: {
      sourcemap: false,
      dir: `${vueVersion}/es`,
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: packageRoot,
    },
    plugins: [
      ...basePlugins,
      extensionResolver({
        modulesToResolve: ['instantsearch.js'],
      }),
      createTerserPlugin({ sourceMap: false }),
      ...(vueVersion === 'vue3' ? [fixVue3SfcExports()] : []),
      createFile(
        'index.js',
        `import InstantSearch from './src/instantsearch.js';
export default InstantSearch;
export * from './src/instantsearch.js';`
      ),
      createPackageJsonPlugin({ type: 'module', sideEffects: true }),
    ],
  };

  const umd = {
    input: 'src/instantsearch.umd.js',
    external: ['vue'],
    output: {
      sourcemap: false,
      file: `${vueVersion}/umd/index.js`,
      format: 'umd',
      name: 'VueInstantSearch',
      exports: 'named',
      globals: {
        vue: 'Vue',
      },
    },
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error(warning.message);
      }
      warn(warning);
    },
    plugins: [
      ...basePlugins,
      createResolvePlugin(),
      createTerserPlugin({ sourceMap: false }),
    ],
  };

  if (isWatching) {
    return [esm];
  }

  return [cjs, esm, umd];
}

export default [...outputs('vue2'), ...(isWatching ? [] : outputs('vue3'))];
