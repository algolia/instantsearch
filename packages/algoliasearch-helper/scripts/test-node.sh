#!/usr/bin/env bash

if [ -f ~/.nvm/nvm.sh ]
then
  source ~/.nvm/nvm.sh
elif [ -f $(brew --prefix nvm)/nvm.sh ]
then
  source $(brew --prefix nvm)/nvm.sh
fi

[ -z $TRAVIS_BUILD_NUMBER ] && CI='false' || CI='true'

set -e # exit when error
if [ $CI == 'true' ]; then
  set -x # debug messages
fi

[ -z $TRAVIS_PULL_REQUEST ] && TRAVIS_PULL_REQUEST='false'
[ -z $TRAVIS_BUILD_NUMBER ] && TRAVIS_BUILD_NUMBER='false'

currentVersion=$(nvm current)

# always test on node 4
echo "Node test 4"
nvm use 4 || nvm install 4
node test/run.js

# in a PR or in local environement, test only on node 0.12
if [ $TRAVIS_PULL_REQUEST != 'false' ] || [ $TRAVIS_BUILD_NUMBER == 'false' ]; then
  echo 'Skipping 0.10 and 0.12 tests (PR or local)'
  exit 0
else
  echo "Node test 0.10"
  nvm use 0.10 || nvm install 0.10
  node test/run.js

  echo "Node test 0.12"
  nvm use 0.12 || nvm install 0.12
  node test/run.js
fi

# switch back to node.js 0.12
nvm use $currentVersion
