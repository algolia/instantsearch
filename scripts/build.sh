#!/usr/bin/env bash

set -ev # exit when error

ROOT=`dirname "$0"`/..

mkdir -p dist/themes

license="/*! instantsearch.js ${VERSION:-UNRELEASED} | © Algolia Inc. and other contributors; Licensed MIT | github.com/algolia/instantsearch.js */"

bundle='instantsearch'

webpack

for source in "$ROOT"/themes/[^_]*.sass; do
  base=`basename "$source" .sass`
  echo "$license" > dist/themes/$base.css
  echo >> dist/themes/$base.css
  node-sass "$source" >> dist/themes/$base.css
  cleancss dist/themes/$base.css > dist/themes/$base.min.css
done

printf "$license" | cat - dist/${bundle}.js > /tmp/out && mv /tmp/out dist/${bundle}.js
cd dist
uglifyjs ${bundle}.js --source-map ${bundle}.min.map --preamble "$license" -c warnings=false -m -o ${bundle}.min.js
cd ..

printf "=> ${bundle}.min.js gzipped will weight `cat dist/${bundle}.min.js | gzip -9 | wc -c | pretty-bytes`\n"
