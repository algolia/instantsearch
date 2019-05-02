#!/usr/bin/env bash

set -e # exit when error

[ -z $CIRCLE_BUILD_NUM ] && CI='false' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

node test/run.js
