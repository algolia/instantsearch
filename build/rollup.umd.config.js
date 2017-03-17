import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import camelize from 'camelize';
import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('package.json'));
let moduleName = camelize(pkg.name);
moduleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

export default {
  entry: 'src/index.js',
  moduleName: moduleName,
  plugins: [
    vue({compileTemplate: true, css: true}),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    buble(),
    commonjs(),
    replace({
      'process.env': JSON.stringify({
        'NODE_ENV': 'production'
      })
    }),
    uglify(),
    filesize()
  ],
  targets: [
    { dest: `dist/${pkg.name}.js`, format: 'umd' },
  ]
};
