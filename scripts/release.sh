#!/usr/bin/env bash

[ -z $HOTFIX ] && HOTFIX='0'

set -e # exit when error

if [[ -n $(npm owner add `npm whoami`) ]]; then
  printf "Release: Not an owner of the npm repo, ask for it\n"
  exit 1
fi

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'master' ]; then
  printf "Release: You must be on master\n"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  printf "Release: Working tree is not clean (git status)\n"
  exit 1
fi

printf "\n\nRelease: update working tree"
git pull origin master
git fetch origin --tags

if [ $HOTFIX == '0' ]; then
  printf "\n\nRelease: merge develop branch"
  git fetch origin develop
  git merge origin/develop
fi

printf "Release: install dependencies"
npm install

currentVersion=`cat package.json | json version`

# header
printf "\n\nRelease: current version is $currentVersion"
printf "\nRelease: a changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nRelease: you must choose a new ve.rs.ion (semver)"
printf "\nRelease: press q to exit the next screen\n\n"

# preview changelog
read -p "=> Release: press [ENTER] to view changes since latest version.."

conventional-changelog --preset angular --output-unreleased | less

# choose and bump new version
# printf "\n\nRelease: Please enter the new chosen version > "
printf "\n=> Release: please type the new chosen version > "
read -e newVersion
VERSION=$newVersion babel-node ./scripts/bump-package-version.js

# build new version
NODE_ENV=production VERSION=$newVersion npm run build

# update changelog
printf "\n\nRelease: update changelog"
changelog=`conventional-changelog -p angular`
conventional-changelog --preset angular --infile CHANGELOG.md --same-file

# regenerate readme TOC
printf "\n\nRelease: generate TOCS"
npm run doctoc

# regenerate widgets jsdoc
printf "\n\nRelease: regenerate widgets jsdoc"
npm run docs:jsdoc

# regenerate package-lock.json
printf "Release: update package-lock.json"
npm install

# git add and tag
commitMessage="v$newVersion\n\n$changelog"
git add src/lib/version.js package-lock.json package.json CHANGELOG.md README.md CONTRIBUTING.md docs/_includes/widget-jsdoc
printf "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nRelease: almost done, check everything in another terminal tab.\n"
read -p "=> Release: when ready, press [ENTER] to push to github and publish the package"

printf "\n\nRelease: push to github, publish on npm"
git push origin master
git push origin --tags
npm publish
git checkout develop
git pull origin develop
git merge master
git push origin develop
git checkout master

printf "Release:
Package was published to npm.
A job on travis-ci will be automatically launched to finalize the release."
