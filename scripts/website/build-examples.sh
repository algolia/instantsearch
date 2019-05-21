#!/usr/bin/env bash

set -e # exit when error

rm -rf website/examples
mkdir website/examples

for example in website/src/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    echo "Building $name example..."

    (cd "$example" && yarn && yarn build && rsync -r "dist/" "../../examples/$name/")
  fi
done
