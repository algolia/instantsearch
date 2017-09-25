import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';

export default {
  entry: 'src/instantsearch.umd.js',
  moduleName: 'VueInstantSearch',
  exports: 'named',
  plugins: [
    vue({ compileTemplate: true, css: false }),
    json(),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    buble({
      transforms: {
        dangerousForOf: true,
      },
    }),
    commonjs(),
    replace({
      'process.env': JSON.stringify({
        NODE_ENV: 'production',
      }),
    }),
    uglify(),
    filesize(),
  ],
  targets: [{ dest: `dist/vue-instantsearch.js`, format: 'umd' }],
};
