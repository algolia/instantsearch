#!/bin/bash

set -e # exit when error

rm -rf public css

echo "➡️  Installing dependencies"

yarn

wait

echo "➡️  Building website"

gulp build && hugo
