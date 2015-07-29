#!/usr/bin/env bash

set -e # exit when error

[ -z $TRAVIS_BUILD_NUMBER ] && CI='false' || CI='true' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

bundle='algoliasearch.helper'

echo "Build"

browserify index.js -s algoliasearchHelper -o dist/algoliasearch.helper.js

echo "..Minify"

uglifyjs dist/algoliasearch.helper.js --mangle --compress=warnings=false > dist/algoliasearch.helper.min.js

echo '..Gzipped file size'

echo "${bundle}.min.js gzipped will weight" $(cat dist/"${bundle}".min.js | gzip -9 | wc -c | pretty-bytes)
