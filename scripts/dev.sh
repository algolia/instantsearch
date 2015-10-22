#!/usr/bin/env bash

set -ev # exit when error

npm install
node-sass -o ./dist/themes/ --watch ./themes &
webpack-dev-server --config webpack.example.config.js --hot --inline --no-info &
wait
