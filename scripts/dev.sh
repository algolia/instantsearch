#!/usr/bin/env bash

set -ev # exit when error

npm install
node-sass -o ./dist/ ./css --output-style expanded
node-sass -o ./dist/ --watch ./css --output-style expanded &
webpack-dev-server --config webpack.dev.config.js --hot --inline --no-info &
wait
