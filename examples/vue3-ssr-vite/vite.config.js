const vuePlugin = require('@vitejs/plugin-vue');
const vueJsx = require('@vitejs/plugin-vue-jsx');

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  plugins: [vuePlugin(), vueJsx()],
  build: {
    minify: false,
  },
  ssr: {
    external: ['algoliasearch-helper', 'qs', 'hogan.js'],
    noExternal: ['vue-instantsearch', 'instantsearch.js'],
  },
};
