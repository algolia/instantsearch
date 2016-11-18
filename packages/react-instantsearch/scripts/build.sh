#!/usr/bin/env bash

set -e # exit when error

mkdir -p dist/
rm -rf dist/*
cp package.json dist/
cp README.md dist/
babel -q index.js -o dist/index.js
babel -q dom.js -o dist/dom.js
babel -q connectors.js -o dist/connectors.js
babel -q native.js -o dist/native.js
babel -q --ignore test.js,__mocks__ --out-dir dist/src src
