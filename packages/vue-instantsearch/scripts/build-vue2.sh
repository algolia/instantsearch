#!/bin/sh
set -e

originalContent=`cat src/util/vue-compat/index.js`

# use v2 for src/util/vue-compat
echo "export * from './index-2';" > src/util/vue-compat/index.js

VUE_VERSION=vue2 rollup -c

# revert src/util/vue-compat
echo "$originalContent" > src/util/vue-compat/index.js

# put an index file for es output
cp ./scripts/es-index-template.js vue2/es/index.js
