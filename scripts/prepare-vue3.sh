#!/usr/bin/env bash

set -e

echo "swapping Vue 3 dependency"
ed -s packages/vue-instantsearch/package.json <<<$',s/"vue": "2.*"/"vue": "3.1.2"/g\nw'

echo "replacing vue-compat aliases"
echo "export * from './index-vue3';" > packages/vue-instantsearch/src/util/vue-compat/index.js

echo "switching to Vue 3 for Jest"
ed -s jest.config.js <<<$',s/vue2-jest/vue3-jest/g\nw'

echo "installing"
yarn
