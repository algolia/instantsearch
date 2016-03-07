#!/usr/bin/env bash

set -e # exit when error

COMMIT_MSG=$(git log --format=%B --no-merges -n 1)
[[ "$COMMIT_MSG" =~ hotfix ]] && is_hotfix=1 || is_hotfix=0
[[ "$COMMIT_MSG" =~ /^docs/ ]] && is_doc=1 || is_doc=0
[[ "$TRAVIS_PULL_REQUEST" == false ]] && is_travis=1 || is_travis=0
[[ "$TRAVIS_BRANCH" == master ]] && is_master=1 || is_master=0
[[ "$TRAVIS_BRANCH" != develop ]] && is_develop=1 || is_develop=0

if [[ $is_travis == 0 ]]; then
  echo "No need to check pull request done on develop branch when not in a pull request"
  exit 0
fi

if [[ ($is_hotfix == 1 || $is_doc == 1) && $is_master == 1 ]]; then
  echo "Hotfix submitted to master, good"
  exit 0
fi

if [[ $is_develop == 0 ]]; then
  echo "Pull request must be done on develop branch"
  exit 1
fi

exit 0
