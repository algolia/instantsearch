#!/usr/bin/env bash

set -e # exit when error

if [ $TRAVIS_PULL_REQUEST == "false" ]; then
  echo "No need to check pull request done on develop branch when not in a pull request"
  exit 0
fi

if [ $TRAVIS_BRANCH != 'develop' ]; then
  echo "Pull request must be done on develop branch"
  exit 1
fi
