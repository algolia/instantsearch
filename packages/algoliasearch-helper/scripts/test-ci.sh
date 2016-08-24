#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

[ -z "$TRAVIS_PULL_REQUEST" ] && TRAVIS_PULL_REQUEST='false'

echo "CI test"

echo "CI test: node"
./scripts/test-node.sh

echo "CI test: lint"
./scripts/lint.sh
