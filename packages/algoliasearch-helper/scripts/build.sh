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

node scripts/minify.js \
  dist/algoliasearch.helper.js \
  dist/algoliasearch.helper.js.map \
  dist/algoliasearch.helper.min.js \
  dist/algoliasearch.helper.min.js.map

echo '..Gzipped file size'

echo "${bundle}.min.js gzipped will weigh" $(cat dist/"${bundle}".min.js | gzip -9 | wc -c | pretty-bytes)
