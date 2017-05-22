import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';

export default {
  entry: 'src/instantsearch.js',
  external: ['algoliasearch', 'algoliasearch-helper', 'escape-html'],
  exports: 'named',
  plugins: [
    vue({ compileTemplate: true, css: true }),
    json(),
    buble({
      transforms: {
        dangerousForOf: true,
      },
    }),
    filesize(),
  ],
  targets: [{ dest: `dist/vue-instantsearch.common.js`, format: 'cjs' }],
};
