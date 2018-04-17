#!/usr/bin/env bash

set -ev # exit when error

# we need to build to run functional tests
NODE_ENV=production yarn run build
INDEX_PAGE=index yarn run test:functional

# push the generated screenshots to Argos-CI.
yarn run argos

# check if the next size of the bundle is inside the threshold
yarn run test:size
