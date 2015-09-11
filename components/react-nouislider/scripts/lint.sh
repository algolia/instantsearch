#!/usr/bin/env bash

set -e # exit when error

printf "\nLint\n"

eslint . --quiet
