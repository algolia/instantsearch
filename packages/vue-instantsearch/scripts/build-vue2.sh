#!/bin/sh
set -e

originalContent=`cat src/util/vue/index.js`

# use v2 for src/util/vue
echo "export * from './index-2';" > src/util/vue/index.js

VUE_VERSION=vue2 rollup -c

# revert src/util/vue
echo "$originalContent" > src/util/vue/index.js

# put an index file for es output
cp ./scripts/es-index-template.js dist/vue2/es/index.js
