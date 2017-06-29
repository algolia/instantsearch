#! /usr/bin/env bash

set -ev # exit when error

if [ -z $TRAVIS_BRANCH ]; then
  currentBranch=`git rev-parse --abbrev-ref HEAD`
else
  currentBranch=$TRAVIS_BRANCH
fi

# if [ $currentBranch != 'master' ]; then
#   printf "update-website: You must be on master"
#   exit 1
# fi

set -e # exit when error

printf "\nPublish website to gh-pages\n"

# Build docs for production
NODE_ENV=production npm run docs:build:dev

# Publish docs to github pages on `/v2`
babel-node scripts/docs/gh-pages.js
