#!/usr/bin/env bash

# cause test to fail if one fails
set -e

# Jest is super slow on the CI machine. Limit the workers to speed up the tests
# https://facebook.github.io/jest/docs/en/troubleshooting.html#tests-are-extremely-slow-on-docker-and-or-continuous-integration-ci-server
if [ "$CI" = "true" ]
  then jest --maxWorkers=4
  else jest
fi

yarn lint
yarn test:regressions
yarn argos
yarn test:build
yarn test:recipes
