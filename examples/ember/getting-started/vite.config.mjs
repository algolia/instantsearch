import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'vite';

/**
 * In this repository, `algoliasearch-helper` is a CommonJS workspace package,
 * not a dependency in `node_modules`, so Vite needs to be told to convert it.
 * An app that installs it from npm needs none of this.
 */
const commonjsWorkspacePackages = ['algoliasearch-helper'];

export default defineConfig({
  optimizeDeps: {
    include: commonjsWorkspacePackages,
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages\/algoliasearch-helper/],
    },
  },
  plugins: [
    ember(),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
});
