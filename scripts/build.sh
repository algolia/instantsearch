#!/bin/bash

set -e # exit when error

rm -rf dist dist-es5-module dist-es6-module
mkdir -p dist dist-es5-module dist-es6-module

echo "➡️  Bundle instantsearch.js to UMD build './dist' via webpack"
NODE_ENV=production BABEL_ENV=production webpack --config scripts/webpack.config.js --hide-modules

printf "dist/instantsearch.min.js gzipped will weight `cat dist/instantsearch.min.js | gzip -9 | wc -c | pretty-bytes`\n\n"

echo "➡️  Bundle instantsearch.js to ES5 build './dist-es5-module' via babel-cli"
BABEL_ENV=production babel -q index.js -o dist-es5-module/index.js &
BABEL_ENV=production babel src -d dist-es5-module/src --ignore *-test.js --quiet

wait

echo "➡️  Bundle instantsearch.js to ES6 build './dist-es6-module' via babel-cli"
BABEL_ENV="production-es6" babel -q index.es6.js -o dist-es6-module/index.js &
BABEL_ENV="production-es6" babel src -d dist-es6-module/src --ignore *-test.js --quiet &

# * allow `import {connectXXX} from 'instantsearch.js/connectors'`
# * allow `import {searchBox} from 'instantsearch.js/widgets'`
echo "export * from './src/connectors/index';" >> ./dist-es6-module/connectors.js &
echo "export * from './src/widgets/index';" >> ./dist-es6-module/widgets.js

wait
