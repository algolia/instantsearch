#!/usr/bin/env bash

set -e # exit when error

[ -z $TRAVIS_BUILD_NUMBER ] && CI='false' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

echo "Test"

echo "Test: node"
./scripts/test-node.sh

echo "Test: phantom"
./scripts/test-phantom.sh

echo "Test: lint"
./scripts/lint.sh
