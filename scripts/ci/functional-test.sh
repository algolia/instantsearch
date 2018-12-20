#!/usr/bin/env bash

set -ev # exit when error

# we need to build to run functional tests
yarn run build
# INDEX_PAGE=index yarn run test:functional # TODO: reactivate this test (temporary disabled during `feat/3.0` development)

# push the generated screenshots to Argos-CI.
yarn run test:argos

# check if the next size of the bundle is inside the threshold
yarn run test:size
