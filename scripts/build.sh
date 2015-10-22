#!/usr/bin/env bash

set -ev # exit when error

mkdir -p dist/themes

license="/*! instantsearch.js ${VERSION:-UNRELEASED} | © Algolia SAS | github.com/algolia/instantsearch.js */"

bundle='instantsearch'

webpack

cat dist/$bundle.js | uglifyjs -c warnings=false -m > dist/$bundle.min.js

cp themes/default.css dist/themes/default.css
cleancss dist/themes/default.css > dist/themes/default.min.css

printf "$license" | cat - dist/"$bundle".js > /tmp/out && mv /tmp/out dist/"$bundle".js
printf "$license" | cat - dist/"$bundle".min.js > /tmp/out && mv /tmp/out dist/"$bundle".min.js

printf "=> $bundle.min.js gzipped will weight `cat dist/$bundle.min.js | gzip -9 | wc -c | pretty-bytes`\n"
