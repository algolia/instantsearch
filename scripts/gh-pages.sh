#! /usr/bin/env bash

set -e # exit when error

printf "\nPublish website to gh-pages\n"

cd docs
rm -rf node_modules/gh-pages/.cache
rm -rf _site
bundle install
JEKYLL_ENV=production VERSION=${VERSION:-UNRELEASED} bundle exec jekyll build
gh-pages --dist _site --branch gh-pages
