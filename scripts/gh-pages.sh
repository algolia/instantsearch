#!/usr/bin/env bash

set -ev # exit when error

webpack --config webpack.example.config.js
cp -R example example-dist
cat example-dist/bundle.js | uglifyjs -c warnings=false -m > example-dist/bundle.min.js
mv example-dist/bundle.min.js example-dist/bundle.js
rm -Rf example-dist/bundle.js.map example-dist/templates/ example-dist/app.js style.css
gh-pages -d example-dist/
rm -Rf example-dist/
