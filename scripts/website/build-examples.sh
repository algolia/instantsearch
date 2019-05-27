#!/usr/bin/env bash
# This scripts builds and copies the dist files
# of the examples to the website.

set -e # exit when error

rm -rf website/examples
mkdir website/examples

for example in examples/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    echo "Building $name example..."

    (cd "$example" && yarn && yarn build && rsync -r "dist/" "../../website/examples/$name/")
  fi
done
