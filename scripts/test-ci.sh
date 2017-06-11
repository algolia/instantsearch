#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm test

# we need to build to run functional tests
NODE_ENV=production npm run build
rm -rf functional-tests/screenshots
INDEX_PAGE=index npm run test:functional
./scripts/validate-commit-msgs.sh
npm run argos

if [ $TRAVIS_PULL_REQUEST == 'false' ] && [ $TRAVIS_BRANCH == 'master' ]; then
  npm run finish-release
fi
