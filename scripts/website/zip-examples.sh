#!/usr/bin/env bash

set -e # exit when error

# Package the examples in the website
for example in website/src/*; do
  if [ -d "$example" ]; then
    name=$(basename "$example")
    (cd "$example" && zip -r "../../examples/$name.zip" ./*)
  fi
done
