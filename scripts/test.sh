#!/usr/bin/env bash

set -e # exit when error

printf "\nTest\n"
babel-tape-runner test/**/*.js

`dirname "$0"`/validate-commit-msgs.sh
