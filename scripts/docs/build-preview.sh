#! /usr/bin/env bash

set -ev # exit when error

VERSION=preview-$(json version < package.json)

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


# Build instantsearch.js library and move the files to the root of the website
NODE_ENV=production VERSION=${VERSION} npm run build
cp dist/* docs-preview

# echo '/ /instantsearch.js/ 301' > docs/_site_preview/_redirects
