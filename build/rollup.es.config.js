import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';
import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('package.json'));
const dependencies = Object.keys(pkg.dependencies || []);

export default {
  entry: 'src/index.js',
  external: dependencies,
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
  targets: [{ dest: `dist/${pkg.name}.esm.js`, format: 'es' }],
};
