#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm test
npm prune
npm run shrinkwrap --dev
./scripts/validate-commit-msgs.sh
NODE_ENV=production npm run build

if [ $TRAVIS_PULL_REQUEST == 'false' ] && [ $TRAVIS_BRANCH == 'master' ]; then
  npm run finish-release
fi
