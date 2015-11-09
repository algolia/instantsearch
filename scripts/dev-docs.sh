#!/usr/bin/env bash

set -ev # exit when error

npm run dev &
cd docs && bundle install && bundle exec guard
