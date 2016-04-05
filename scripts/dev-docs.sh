#!/usr/bin/env bash

set -ev # exit when error

cd docs && bundle install && bundle exec guard &
cd docs && bundle exec jekyll serve --verbose &
npm run dev &
wait
