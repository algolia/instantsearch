#!/usr/bin/env bash

set -e # exit when error

printf "\nDev\n"

webpack-dev-server --config webpack.example.config.js\
  --hot --inline
