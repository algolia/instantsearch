#!/usr/bin/env bash

set -e

rm -rf react-instantsearch
git clone git@github.com:algolia/react-instantsearch.git --branch master --depth=1
cd react-instantsearch
yarn --ignore-engines
yarn link instantsearch-e2e-tests
yarn run website:build
if [ "$SAUCELABS" ]; then
  yarn run test:e2e:saucelabs
else
  yarn run test:e2e
fi
