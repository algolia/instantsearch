#!/usr/bin/env bash

# cause test to fail if one fails
set -e

if [ "$CI" = "true" ]
  then jest --projects packages/* --runInBand
  else jest --projects packages/*
fi
yarn lint
yarn test:regressions
yarn argos
NODE_ENV=production yarn test:build
yarn test:recipes
