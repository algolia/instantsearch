#!/usr/bin/env bash

set -ev # exit when error

webpack --config webpack.example.config.js
cp -r example example-dist
cat example-dist/bundle.js | uglifyjs -c warnings=false -m > example-dist/bundle.min.js
mv example-dist/bundle.min.js example-dist/bundle.js
rm example-dist/bundle.js.map example-dist/templates/ example-dist/app.js style.css -rf
gh-pages -d example-dist/
rm -rf example-dist/
