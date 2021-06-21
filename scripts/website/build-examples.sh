#!/usr/bin/env bash
# This scripts builds and copies the dist files
# of the examples to the website.

set -e # exit when error

rm -rf website/examples
mkdir website/examples

build_example() {
  name=$1
  echo "Building $name example..."

  (cd "$example" && yarn && yarn build && cp -r "dist/" "../../website/examples/$name/")
}

if [ -z "$1" ]; then
  for example in examples/*; do
    if [ -d "$example" ]; then
      name=$(basename "$example")
      build_example $name
    fi
  done
else
  cd examples/$1
  build_example $1
fi
