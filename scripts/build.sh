#!/bin/bash

set -e # exit when error

rm -rf dist dist-es5-module es connectors.js instantsearch.js widgets.js
mkdir -p dist dist-es5-module es

echo "➡️  Bundle instantsearch.js to UMD build './dist' via webpack"
NODE_ENV=production BABEL_ENV=production webpack --config scripts/webpack.config.js --hide-modules

# https://stackoverflow.com/questions/16745988/sed-command-with-i-option-in-place-editing-works-fine-on-ubuntu-but-not-mac
sed -i.bak 's/sourceMappingURL=instantsearch\.min\.js\.map/sourceMappingURL=\/dist\/instantsearch\.min\.js\.map/g' dist/instantsearch.min.js && rm dist/instantsearch.min.js.bak

wait

printf "dist/instantsearch.min.js gzipped will weigh `cat dist/instantsearch.min.js | gzip -9 | wc -c | pretty-bytes`\n\n"

echo "➡️  Bundle instantsearch.js to ES5 build './dist-es5-module' via babel-cli"
BABEL_ENV=production babel -q index.js -o dist-es5-module/index.js &
BABEL_ENV=production babel src -d dist-es5-module/src --ignore *-test.js --quiet

wait

echo "➡️  Bundle instantsearch.js to ES6 build './es' via babel-cli"
BABEL_ENV="production-es6" babel -q index.es6.js -o es/index.js &
BABEL_ENV="production-es6" babel src -d es --ignore *-test.js --quiet &

wait
