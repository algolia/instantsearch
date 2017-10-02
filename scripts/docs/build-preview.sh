#! /usr/bin/env bash

set -ev # exit when error

VERSION=preview-`cat package.json | json version`

set -e # exit when error

NODE_ENV=production VERSION=${VERSION} npm run build
(cd docs
bundle install
rm -rf _site_preview
JEKYLL_ENV=production VERSION=${VERSION} bundle exec jekyll build --destination _site_preview/instantsearch.js/v1 --config _config.yml,_preview.yml
for example in _site_preview/examples/*; do
  if [ -d "$example" ]; then
    name=`basename "$example"`
    (cd "$example" && zip -r ../$name.zip *)
  fi
done)
cp dist/* docs/_site_preview/instantsearch.js/v1/
echo '/ /instantsearch.js/v1/ 301' > docs/_site_preview/_redirects
