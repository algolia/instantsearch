#! /usr/bin/env bash

set -e # exit when error

NODE_ENV=${NODE_ENV:-development}
VERSION=preview-$(json version < package.json)

# Build instantsearch.js library
yarn install --production=false
NODE_ENV=production VERSION=${VERSION} yarn run build

# Build the documentation
rm -rf docs
mkdir -p docs

(
  cd docgen
  yarn install --production=false
  NODE_ENV=$NODE_ENV yarn run build
)

# Package the examples in the website
for example in docs/examples/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    (cd "$example" && zip -r "../$name.zip" ./*)
  fi
done

# Copy instantsearch.js UMD builds to the website root
mkdir docs/lib
cp dist/* docs/lib

# Build storybook
yarn run docs:storybook:build

# Move storybook to website-root
mv storybook/dist docs/stories
