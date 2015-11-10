#!/usr/bin/env bash

set -ev # exit when error

cd docs && bundle install && npm run dev & bundle exec guard & wait
