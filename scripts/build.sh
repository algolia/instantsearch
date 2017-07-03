#! /usr/bin/env bash

set -ev # exit when error

rm -rf dist dist-es5-module
mkdir -p dist dist-es5-module

webpack --config scripts/webpack.config.js &
babel -q index.js -o dist-es5-module/index.js &
babel src -d dist-es5-module/src --ignore *-test.js --quiet

wait

printf "=> instantsearch.min.js gzipped will weight `cat dist/instantsearch.min.js | gzip -9 | wc -c | pretty-bytes`\n"
