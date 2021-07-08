#!/bin/sh
set -e

originalContent=`cat src/util/vue/index.js`

# use v3 for src/util/vue
echo "export * from './index-3';" > src/util/vue/index.js

VUE_VERSION=vue3 rollup -c

# revert src/util/vue
echo "$originalContent" > src/util/vue/index.js

# put an index file for es output
cp ./scripts/es-index-template.js dist/vue3/es/index.js
