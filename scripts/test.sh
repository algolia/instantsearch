#!/usr/bin/env bash

set -e # exit when error

printf "\nTest\n"

babel-tape-runner test/**/*.js
