#!/usr/bin/env bash

set -e # exit when error

bundle='instantsearch'

printf "\nBuild\n"

printf "\nBuild:webpack\n"
webpack

printf "\nBuild: minify\n"
cat dist/$bundle.js | uglifyjs -c warnings=false -m > dist/$bundle.min.js

printf "\nBuild: filesize\n"

echo "${bundle}.min.js gzipped will weight" $(cat dist/"${bundle}".min.js | gzip -9 | wc -c | pretty-bytes)
