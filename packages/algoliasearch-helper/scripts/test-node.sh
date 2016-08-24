#!/usr/bin/env bash

[ -z $TRAVIS_BUILD_NUMBER ] && CI='false' || CI='true'

set -e # exit when error
if [ $CI == 'true' ]; then
  set -x # debug messages
fi

node test/run.js | tap-spec
