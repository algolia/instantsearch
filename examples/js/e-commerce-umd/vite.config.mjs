import { createRequire } from 'module';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

const require = createRequire(import.meta.url);

function removeCrossOrigin() {
  return {
    name: 'remove-crossorigin',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/ crossorigin/g, '');
      },
    },
  };
}

/**
 * Transpiles the UMD bundle copied from public/ to ES5 so IE11 can parse it.
 * Uses the @babel/core already available via @vitejs/plugin-legacy.
 */
function transpileUmdBundle() {
  let outDir;
  return {
    name: 'transpile-umd-bundle',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      const babel = require('@babel/core');
      const target = resolve(
        outDir,
        'packages/instantsearch.js/dist/instantsearch.production.min.js'
      );
      if (!existsSync(target)) return;
      const code = readFileSync(target, 'utf-8');
      const result = await babel.transformAsync(code, {
        presets: [['@babel/preset-env', { targets: 'IE 11' }]],
        compact: true,
        sourceMaps: false,
      });
      if (result?.code) {
        writeFileSync(target, result.code);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    commonjs(),
    legacy({
      targets: ['defaults', 'IE 11'],
      renderModernChunks: false,
    }),
    removeCrossOrigin(),
    transpileUmdBundle(),
  ],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
