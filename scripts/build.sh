#!/usr/bin/env bash

set -e # exit when error

license="/*! instantsearch.js ${VERSION:-UNRELEASED} | © Algolia SAS | github.com/algolia/instantsearch.js */"

bundle='instantsearch'

printf "\n\nBuild"

printf "\n\nBuild:webpack"
webpack

printf "\n\nBuild: minify"
cat dist/$bundle.js | uglifyjs -c warnings=false -m > dist/$bundle.min.js

printf "\n\nBuild: prepend license"
printf "$license" | cat - dist/"$bundle".js > /tmp/out && mv /tmp/out dist/"$bundle".js
printf "$license" | cat - dist/"$bundle".min.js > /tmp/out && mv /tmp/out dist/"$bundle".min.js

printf "\n\nBuild: filesize"

printf "=> $bundle.min.js gzipped will weight `cat dist/$bundle.min.js | gzip -9 | wc -c | pretty-bytes`\n"
