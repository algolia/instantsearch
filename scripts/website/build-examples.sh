#!/usr/bin/env bash
# This scripts builds and copies the dist files
# of the examples to the website.

set -e # exit when error

rm -rf website/examples
mkdir website/examples

build_example() {
  example=$1
  name=$2
  echo "Building $name example..."

  (
    cd "$example" &&
    yarn &&
    yarn build &&
    cp -r "dist/" "../../website/examples/$name/"
  )
}

if [ -z "$1" ]; then
  for example in examples/*; do
    if [ -d "$example" ]; then
      name=$(basename "$example")
      build_example $example $name
    fi
  done
else
  build_example examples/$1 $1
fi
