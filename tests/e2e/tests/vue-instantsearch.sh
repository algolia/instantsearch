#!/usr/bin/env bash

set -e

rm -rf vue-instantsearch
git clone git@github.com:algolia/vue-instantsearch.git --branch master --depth=1
cd vue-instantsearch
yarn --ignore-engines
yarn link instantsearch-e2e-tests
yarn run examples:build
if [ "$SAUCELABS" ]; then
  yarn run test:e2e:saucelabs
else
  yarn run test:e2e
fi
