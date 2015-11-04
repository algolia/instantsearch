#!/usr/bin/env bash

mkdir -p dist/
mkdir -p dist-es5-module/

set -ev # exit when error

ROOT=`dirname "$0"`/..

license="/*! instantsearch.js ${VERSION:-UNRELEASED} | © Algolia Inc. and other contributors; Licensed MIT | github.com/algolia/instantsearch.js */"

bundle='instantsearch'

# build for jsdelivr, with everything inlined while exposing React + ReactDOM (for plugins)
webpack --config webpack.config.jsdelivr.babel.js

# only transpile to ES5 for package.json main entry
babel -q index.js -o dist-es5-module/index.js
declare -a sources=("components" "decorators" "lib" "shams" "widgets")
for source in "${sources[@]}"
do
  babel -q --out-dir dist-es5-module/${source} ${source}
done

for source in "$ROOT"/css/[^_]*.scss; do
  base=`basename "$source" .scss`
  echo "$license" > dist/$base.css
  echo >> dist/$base.css
  node-sass --output-style expanded "$source" | postcss --use autoprefixer >> dist/$base.css
  cleancss dist/$base.css > dist/$base.min.css
done

printf "$license" | cat - dist/${bundle}.js > /tmp/out && mv /tmp/out dist/${bundle}.js
cd dist
uglifyjs ${bundle}.js --source-map ${bundle}.min.map --preamble "$license" -c warnings=false -m -o ${bundle}.min.js
cd ..

printf "=> ${bundle}.min.js gzipped will weight `cat dist/${bundle}.min.js | gzip -9 | wc -c | pretty-bytes`\n"
