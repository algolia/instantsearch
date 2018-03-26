#!/usr/bin/env bash

# This script is used to test our recipes before upgrading their deps or adding a feature

# cause test to fail if one fails
set -e

for d in examples/* ; do
    cd $d
    yarn
    yarn build
    if [ "$CI" = "true" ]
        then yarn test --runInBand
        else yarn test
    fi
    cd ../..
done
