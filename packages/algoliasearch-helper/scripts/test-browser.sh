#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

[ -z $TRAVIS_PULL_REQUEST ] && TRAVIS_PULL_REQUEST='false'

echo "Browser test"

echo "Browser test: build and minify"
npm run build

echo "Browser test"
DEBUG=zuul* zuul --no-coverage -- test/run.js
