#!/usr/bin/env bash

# cause test to fail if one fails
set -e

yarn jest
yarn lint
yarn test:regressions
yarn argos
yarn test:build
yarn test:recipes
