#!/usr/bin/env bash

set -ev # exit when error

yarn
node-sass -o ./dist/ ./src/css --output-style expanded
node-sass -o ./dist/ --watch ./src/css --output-style expanded &
webpack-dev-server --config dev/webpack.dev.config.babel.js --hot --inline --no-info &
wait
