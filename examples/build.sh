#!/usr/bin/env bash
# this builds examples, works from any directory (yarn build:examples)
# This script can be removed once we figure out why CodeSandbox doesn't build the examples
# try: https://codesandbox.io/s/github/algolia/vue-instantsearch/tree/feat/connectors/examples/ecommerce
set -e

# go into directory of script
cd $(dirname `which $0`)

for dir in ./* ; do
  if [ -d "$dir" ]; then
      name=$(basename "$dir")
      echo "building example: $name"
      cd $name
      yarn
      yarn build
      cp -R dist ../../docs/dist/examples/$name
      cd ..
  fi
done

echo "done building examples 🙌"
