#!/usr/bin/env bash

set -ev # exit when error

ROOT=`dirname "$0"`/..

mkdir -p dist/themes

license="/*! instantsearch.js ${VERSION:-UNRELEASED} | © Algolia Inc. and other contributors; Licensed MIT | github.com/algolia/instantsearch.js */"

bundle='instantsearch'

printf "\n\nBuild"

printf "\n\nBuild: webpack\n"
webpack

printf "\n\nBuild: minify\n"
cat dist/$bundle.js | uglifyjs -c warnings=false -m > dist/$bundle.min.js

printf "\n\nBuild: CSS\n"
for source in "$ROOT"/themes/[^_]*.sass; do
  base=`basename "$source" .sass`
  echo "$license" > dist/themes/$base.css
  echo >> dist/themes/$base.css
  node-sass "$source" >> dist/themes/$base.css
  cleancss dist/themes/$base.css > dist/themes/$base.min.css
done

printf "\n\nBuild: prepend license\n"
printf "$license" | cat - dist/"$bundle".js > /tmp/out && mv /tmp/out dist/"$bundle".js
printf "$license" | cat - dist/"$bundle".min.js > /tmp/out && mv /tmp/out dist/"$bundle".min.js

printf "\n\nBuild: filesize\n"

printf "=> $bundle.min.js gzipped will weight `cat dist/$bundle.min.js | gzip -9 | wc -c | pretty-bytes`\n"
