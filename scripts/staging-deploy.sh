#!/usr/bin/env bash

set -ev # exit when error

yarn
NODE_ENV=production webpack --config dev/webpack.config.js

surge dev/dist

rm -rf dev/dist
