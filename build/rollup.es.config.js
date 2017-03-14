import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('package.json'));
const dependencies = Object.keys(pkg.dependencies || []);

export default {
  entry: 'src/index.js',
  external: dependencies,
  plugins: [
    vue({compileTemplate: true, css: false}),
    buble(),
    filesize()
  ],
  targets: [
    { dest: `dist/${pkg.name}.esm.js`, format: 'es' },
  ]
};
