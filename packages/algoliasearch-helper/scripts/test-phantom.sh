#!/usr/bin/env bash

set -e # exit when error

[ -z $TRAVIS_BUILD_NUMBER ] && CI='false' || CI='true'
if [ $CI == 'true' ]; then
  set -x # debug messages
fi

echo "Phantom test"

DEBUG=zuul* zuul --no-coverage --phantom -- test/run.js
