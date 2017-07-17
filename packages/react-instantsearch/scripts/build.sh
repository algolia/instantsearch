#!/usr/bin/env bash

set -e # exit when error

# copy files
mkdir -p dist/ &&
rm -rf dist/* &&
cp package.json dist/ &&
cp README.md dist/

# first make es module build
mkdir -p dist/es &&
NODE_ENV=es babel -q index.js -o dist/es/index.js &&
NODE_ENV=es babel -q dom.js -o dist/es/dom.js &&
NODE_ENV=es babel -q connectors.js -o dist/es/connectors.js &&
NODE_ENV=es babel -q native.js -o dist/es/native.js &&
NODE_ENV=es babel -q server.js -o dist/es/server.js &&
NODE_ENV=es babel -q --ignore test.js,__mocks__ --out-dir dist/es/src src

# then also make a commonjs build
babel -q index.js -o dist/index.js &&
babel -q dom.js -o dist/dom.js &&
babel -q connectors.js -o dist/connectors.js &&
babel -q native.js -o dist/native.js &&
babel -q server.js -o dist/server.js &&
babel -q --ignore test.js,__mocks__ --out-dir dist/src src

# finally a UMD build
NODE_ENV=production webpack

license="/*! ReactInstantSearch ${VERSION:-UNRELEASED} | © Algolia, inc. | https://community.algolia.com/react-instantsearch/ */"
umd_dist="dist/umd"
entries=( 'Core' 'Dom' 'Connectors')
for entry in "${entries[@]}"
do
  dist_file="$umd_dist/${entry}.js"
  dist_file_min="$umd_dist/${entry}.min.js"
  source_map="${entry}.js.map"
  source_map_min="${entry}.min.js.map"
  dist_file_sourcemap="$umd_dist/${source_map}"
  dist_file_sourcemap_min="$umd_dist/${source_map_min}"

  echo "$license" | cat - "${dist_file}" > /tmp/out && mv /tmp/out "${dist_file}"

  uglifyjs "${dist_file}" \
    --in-source-map "${dist_file_sourcemap}" \
    --source-map "${dist_file_sourcemap_min}" \
    --source-map-url "${source_map_min}" \
    --preamble "$license" \
    -c warnings=false \
    -m \
    -o "${dist_file_min}"

  gzip_size=$(gzip -9 < "$dist_file_min" | wc -c | pretty-bytes)
  echo "=> $dist_file_min gzipped will weigh $gzip_size"
done
