#!/bin/bash

set -e # exit when error

rm -rf public css

echo "➡️  Installing dependencies"

brew install hugo && yarn

wait

echo "➡️  Building website"

gulp build && hugo
