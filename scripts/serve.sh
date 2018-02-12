#!/usr/bin/env bash
# Serves the current build version on a local server available (by default) on
# http://127.0.0.1:8080/instantsearch.js
#
# This is useful when you want to test the latest instantsearch.js version
# (including your own branches) on a specific local project. Just run `npm run
# serve` in the instantsearch repository, on link the file in your project.
#
# This works by running webpack in watch mode as well as simply serving the dist
# folder through a local web server.

yarn
NODE_ENV=development webpack-dev-server --config ./scripts/webpack.config.js --content-base dist/
