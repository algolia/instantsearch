#!/usr/bin/env bash

set -ev # exit when error

yarn
NODE_ENV=development webpack-dev-server --config dev/webpack.config.js
