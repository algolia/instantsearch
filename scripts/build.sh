#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

echo "Build"
browserify -s instantsearch > dist/instantsearch.js

echo "Build:minify"
cat dist/instantsearch.min.js | uglifyjs -c warnings=false -m > dist/instantsearch.min.js
