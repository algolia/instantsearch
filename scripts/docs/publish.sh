#! /usr/bin/env bash

set -ev # exit when error

if [ -z $TRAVIS_BRANCH ]; then
  currentBranch=`git rev-parse --abbrev-ref HEAD`
else
  currentBranch=$TRAVIS_BRANCH
fi

if [ $currentBranch != 'master' ]; then
  printf "update-website: You must be on master"
  exit 1
fi

set -e # exit when error

printf "\nPublish website to gh-pages\n"

# Build instantsearch.js library
VERSION=preview-$(json version < package.json)
NODE_ENV=production VERSION=${VERSION} yarn run build

# Clean old ./docs folder if any
rm -rf docs
mkdir -p docs

# Build docs for production
(
  cd docgen
  yarn install && NODE_ENV=production yarn run build
)

# Package the examples in the website
for example in docs_preview/examples/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    (cd "$example" && zip -r "../$name.zip" ./*)
  fi
done

# Copy instantsearch.js builds to the website root
cp dist/* docs

# publish
babel-node scripts/docs/gh-pages.js
