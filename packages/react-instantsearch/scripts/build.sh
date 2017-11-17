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
BABEL_ENV=es rollup -c rollup.config.js
