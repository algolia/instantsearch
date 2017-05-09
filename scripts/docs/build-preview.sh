#! /usr/bin/env bash

set -ev # exit when error

VERSION=preview-$(json version < package.json)

# Build instantsearch.js library
NODE_ENV=production VERSION=${VERSION} npm run build

# Build the documentation
rm -rf docs-preview
(
  cd docgen
  npm install && npm run build
)


# Package the examples in the website
for example in docs_preview/examples/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    (cd "$example" && zip -r "../$name.zip" ./*)
  fi
done

# Copy instantsearch.js builds to the website root
cp dist/* docs-preview

# echo '/ /instantsearch.js/ 301' > docs/_site_preview/_redirects
