#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const shell = require('shelljs');

console.log('swapping Vue 3 dependency');
shell.sed(
  '-i',
  /"vue": "^?2.*"(,?)/,
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

console.log('switching to Vue 3 for Jest');
shell.sed(
  '-i',
  /vue2-jest/,
  'vue3-jest',
  path.resolve(__dirname, '../jest.config.js')
);

console.log('installing');
shell.exec('yarn');

assert.equal(
  require('vue/package.json').version[0],
  '3',
  'Algoliasearch major version should be 3'
);
