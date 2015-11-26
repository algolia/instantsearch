#! /usr/bin/env bash

set -ev # exit when error

${ALGOLIA_API_KEY:?"Please provide the ALGOLIA_API_KEY env variable"}

cd docs/
bundle exec jekyll algolia push
cd ..
