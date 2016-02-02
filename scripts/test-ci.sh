#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm test
npm run test:browser
# we need to build to run functional tests
NODE_ENV=production npm run build
npm run test:functional
npm prune
npm run shrinkwrap --dev
./scripts/validate-commit-msgs.sh

if [ $TRAVIS_PULL_REQUEST == 'false' ] && [ $TRAVIS_BRANCH == 'master' ]; then
  npm run finish-release
fi
