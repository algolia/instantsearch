#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

[ -z $TRAVIS_PULL_REQUEST ] && TRAVIS_PULL_REQUEST='false'

echo "CI test"

echo "CI test: node"
./scripts/test-node.sh

echo "CI test: browser"
./scripts/test-browser.sh

echo "CI test: phantom"
./scripts/test-phantom.sh

echo "CI test: lint"
./scripts/lint.sh

echo "CI test: shrinkwrap"
npm run shrinkwrap
