#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm test
# we need to build to run functional tests
NODE_ENV=production npm run build
INDEX_PAGE=index npm run test:functional
INDEX_PAGE=index-preact npm run test:functional
./scripts/validate-commit-msgs.sh
npm run docs:jsdoc # check we are able to generate docs

# test the website can be built without errors
cd docs
bundle install
JEKYLL_ENV=production VERSION=${VERSION} bundle exec jekyll build --config _config.yml,_production.yml

if [ $TRAVIS_PULL_REQUEST == 'false' ] && [ $TRAVIS_BRANCH == 'master' ]; then
  npm run finish-release
fi
