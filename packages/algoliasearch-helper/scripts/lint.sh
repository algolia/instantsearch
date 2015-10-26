#!/usr/bin/env bash

set -e # exit when error

[ -z $TRAVIS_BUILD_NUMBER ] && CI='false' || CI='true' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

echo "Lint"

eslint . --quiet
