#!/usr/bin/env bash

# Use this script to install dependencies of every packages
rm -rf node_modules packages/react-instantsearch/node_modules packages/react-instantsearch-theme-algolia/node_modules &&
NODE_ENV=development yarn &&
(cd node_modules/react && yarn link) &&
(cd node_modules/react-dom && yarn link) &&
(cd packages/react-instantsearch && yarn && yarn link && yarn link react && yarn link react-dom) &&
(cd packages/react-instantsearch-theme-algolia && yarn && yarn link && yarn link react && yarn link react-dom) &&
yarn link react-instantsearch &&
yarn link react-instantsearch-theme-algolia
