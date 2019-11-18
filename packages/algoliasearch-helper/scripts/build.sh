#!/usr/bin/env bash

set -e # exit when error

[ -z $CIRCLE_BUILD_NUM ] && CI='false' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

bundle='algoliasearch.helper'

echo "Build"

mkdir -p dist

browserify index.js \
  --standalone algoliasearchHelper \
  --debug | \
  exorcist dist/algoliasearch.helper.js.map > dist/algoliasearch.helper.js

echo "..Minify"

uglifyjs dist/algoliasearch.helper.js \
  --mangle \
  --compress=warnings=false \
  --in-source-map "dist/algoliasearch.helper.js.map" \
  --source-map "dist/algoliasearch.helper.min.js.map" \
  --output dist/algoliasearch.helper.min.js

echo '..Gzipped file size'

echo "${bundle}.min.js gzipped will weigh" $(cat dist/"${bundle}".min.js | gzip -9 | wc -c | pretty-bytes)
