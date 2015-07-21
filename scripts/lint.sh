#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

echo "Lint"

eslint . --quiet
