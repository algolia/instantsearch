#!/usr/bin/env bash

set -ev # exit when error

mkdir -p dist/themes

license="/*! instantsearch.js ${VERSION:-UNRELEASED} | © Algolia SAS | github.com/algolia/instantsearch.js */"

bundle='instantsearch'

webpack

cp themes/default.css dist/themes/default.css
cleancss dist/themes/default.css > dist/themes/default.min.css

printf "$license" | cat - dist/${bundle}.js > /tmp/out && mv /tmp/out dist/${bundle}.js
cd dist
uglifyjs ${bundle}.js --source-map ${bundle}.min.map --preamble "$license" -c warnings=false -m -o ${bundle}.min.js
cd ..

printf "=> ${bundle}.min.js gzipped will weight `cat dist/${bundle}.min.js | gzip -9 | wc -c | pretty-bytes`\n"
