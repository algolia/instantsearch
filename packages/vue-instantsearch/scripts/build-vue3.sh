#!/bin/sh
set -e

originalContent=`cat src/util/vue-compat/index.js`

# use v3 for src/util/vue-compat
echo "export * from './index-3';" > src/util/vue-compat/index.js

VUE_VERSION=vue3 rollup -c

# revert src/util/vue-compat
echo "$originalContent" > src/util/vue-compat/index.js

# put an index file for es output
cp ./scripts/es-index-template.js vue3/es/index.js
