#!/usr/bin/env bash

# cause test to fail if one fails
set -e

if [ "$CI" = "true" ]
  then jest --runInBand 
  else jest
fi
yarn lint
# issue with happo due to storybook. Uncomment when fixed. 
# yarn test:regressions
# yarn argos
NODE_ENV=production yarn test:build
yarn test:recipes
