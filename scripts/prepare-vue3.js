#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const shell = require('shelljs');

console.log('swapping Vue 3 dependency');
shell.sed(
  '-i',
  /"vue": "2.*"(,?)/,
  '"vue": "3.2.47"$1',
  path.resolve(__dirname, '../packages/vue-instantsearch/package.json')
);

console.log('replacing vue-compat aliases');
fs.writeFileSync(
  path.resolve(
    __dirname,
    '../packages/vue-instantsearch/src/util/vue-compat/index.js'
  ),
  "export * from './index-vue3';"
);
fs.writeFileSync(
  path.resolve(
    __dirname,
    '../packages/vue-instantsearch/src/util/vue-compat/Highlighter/index.js'
  ),
  "export { default } from './index-vue3';"
);

console.log('switching to Vue 3 for Jest');
shell.sed(
  '-i',
  /vue2-jest/,
  'vue3-jest',
  path.resolve(__dirname, '../jest.config.js')
);

console.log('installing');
shell.exec('yarn');
