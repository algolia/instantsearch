#!/usr/bin/env bash

set -ev # exit when error

npm install
node-sass -o ./dev/ ./src/css --output-style expanded
webpack --config dev/webpack.staging.config.babel.js --hot --inline --no-info

mv ./dev/instantsearch.css ./dev/instantsearch.css.symlink
cp ./dist/instantsearch.css ./dev/instantsearch.css

surge dev

rm ./dev/instantsearch.css
mv ./dev/instantsearch.css.symlink ./dev/instantsearch.css
rm ./dev/bundle.js
rm ./dev/bundle.js.map
