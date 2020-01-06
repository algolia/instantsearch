#!/usr/bin/env bash

set -e

rm -rf instantsearch.js
git clone git@github.com:algolia/instantsearch.js.git --branch develop --depth=1
cd instantsearch.js
yarn --ignore-engines
yarn link instantsearch-e2e-tests
yarn run website:build
if [ "$SAUCELABS" ]; then
  yarn run test:e2e:saucelabs
else
  yarn run test:e2e
fi
