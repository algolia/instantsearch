#!/usr/bin/env bash

# This script is used to test the build steps of our packages
# to ensure we will be able to release new versions

set -e # exit when error

(cd packages/react-instantsearch && yarn build)
(cd packages/react-instantsearch && yarn test:size)
