#! /usr/bin/env bash

: ${VERSION?"Please provide the VERSION env variable"}

set -e # exit when error

printf "\nPublish website to gh-pages\n"

cd docs
rm -rf node_modules/gh-pages/.cache
rm -rf _site
bundle install
JEKYLL_ENV=production VERSION=${VERSION} bundle exec jekyll build
for example in _site/examples/*; do
  if [ -d "$example" ]; then
    name=`basename "$example"`
    (cd "$example" && zip -r ../$name.zip *)
  fi
done
gh-pages --dist _site --branch gh-pages
