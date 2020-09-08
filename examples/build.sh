#!/usr/bin/env bash
# this builds examples, works from any directory (yarn build:examples)
# This script can be removed once we figure out why CodeSandbox doesn't build the examples
# try: https://codesandbox.io/s/github/algolia/vue-instantsearch/tree/feat/connectors/examples/e-commerce
set -e

# go into directory of script
cd $(dirname `which $0`)


function build_example {
  dir=$1
  if [ -d "$dir" ]; then
    name=$(basename "$dir")
    echo "building example: $name"
    cd $name
    if [[ "$name" != "nuxt" && "$name" != "ssr" ]]; then
      yarn
      yarn build
      mkdir -p ../../website/examples/$name
      cp -R dist/* ../../website/examples/$name
    else
      echo "build of $name skipped"
    fi
    cd ..
  fi
}

if [ $# -eq 0 ];then
  for dir in ./* ; do
    build_example $dir
  done
else
  build_example $1
fi

echo "done building examples 🙌"
