#! /usr/bin/env bash

set -ev # exit when error

cd docs/
bundle exec jekyll algolia push
cd ..
