#!/bin/bash

set -e # exit on error

# replace all imports of instantsearch.js with /cjs
find dist/cjs -type f -exec sed -i.bak 's|instantsearch.js/es|instantsearch.js/cjs|g' {} +

# clean up the .bak files, as the set -i'' can not be enabled on BSD/Mac and Linux with the same syntax
find dist/cjs -name '*.bak' -type f -exec rm {} +

# create a package.json to be able to import using require
touch dist/cjs/package.json
echo '{ "type": "commonjs", "sideEffects": false }' > dist/cjs/package.json
