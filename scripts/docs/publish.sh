#! /usr/bin/env bash

set -e # exit when error

echo Publishing InstantSearch.js website...

if [ -z "$TRAVIS_BRANCH" ]; then
  currentBranch=$(git rev-parse --abbrev-ref HEAD)
else
  currentBranch=$TRAVIS_BRANCH
fi

if [ "$currentBranch" != 'master' ]; then
  echo "You are not running this script from master."
  echo -n "Are you sure you want to proceed (y/n)? "
  read -r answer
  if echo "$answer" | grep -iq "^y" ;then
    echo As you wish...
  else
    exit 1
  fi
fi

set -e # exit when error

printf "\nPublish website to gh-pages\n"

# Build docs for production
NODE_ENV=production npm run docs:build:dev

# Publish docs to github pages on `/v2`
babel-node scripts/docs/gh-pages.js
