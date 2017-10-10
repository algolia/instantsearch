#! /usr/bin/env bash

set -e # exit when error

NODE_ENV=${NODE_ENV:-development}
VERSION=preview-$(json version < package.json)

# Build instantsearch.js library
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
for example in docs/v2/examples/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    (cd "$example" && zip -r "../$name.zip" ./*)
  fi
done

# Copy instantsearch.js builds to the website root
cp dist/* docs/v2/

# Build dev-novel
NODE_ENV=production webpack --config dev/webpack.config.js

# Move dev-novel to website-root
mv dev/dist docs/v2/dev-novel
