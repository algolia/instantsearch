#!/usr/bin/env bash

set -ev # exit when error

# we are building gh-pages
if [ $TRAVIS_BRANCH == 'gh-pages' ]; then
  echo "Skipping tests since branch being built is gh-pages"
  exit 0
fi

./scripts/validate-pr-done-on-develop.sh
npm test
npm prune
npm run shrinkwrap --dev
./scripts/validate-commit-msgs.sh
NODE_ENV=production npm run build
