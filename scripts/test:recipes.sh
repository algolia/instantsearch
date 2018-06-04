#!/usr/bin/env bash

# This script is used to test our recipes before upgrading their deps or adding a feature

# cause test to fail if one fails
set -e

for example in examples/* ; do
  (
    cd $example
    yarn
    yarn build
    yarn test
  )
done
