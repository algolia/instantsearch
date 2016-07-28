#!/usr/bin/env bash

set -e # exit when error

printf "
Launching dev environment
"

npm install
cd docs/
bundle install
bundle exec middleman
