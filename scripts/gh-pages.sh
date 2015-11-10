#! /usr/bin/env bash

set -e # exit when error

printf "\nPublish website to gh-pages\n"

cd docs
rm -rf node_modules/gh-pages/.cache
rm -rf _site
bundle install
VERSION=`cat package.json | json version` bundle exec jekyll build
gh-pages --dist _site --branch gh_pages
