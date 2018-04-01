#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm run lint
npm test

# we need to build to run functional tests
NODE_ENV=production npm run build
INDEX_PAGE=index npm run test:functional

# push the generated screenshots to Argos-CI.
npm run argos

# check if the next size of the bundle is inside the threshold
npm run test:size

if [ $TRAVIS_PULL_REQUEST == 'false' ] && [ $TRAVIS_BRANCH == 'master' ]; then
  npm run finish-release
fi
