#!/usr/bin/env bash

# Use this script to install dependencies of every packages

set -e # exit when error

rm -rf node_modules packages/*/node_modules
NODE_ENV=development yarn
(cd node_modules/react && yarn link)
(cd node_modules/react-dom && yarn link)
(cd packages/react-instantsearch && yarn && yarn link && yarn link react && yarn link react-dom)
yarn link react-instantsearch
