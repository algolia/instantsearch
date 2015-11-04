#!/usr/bin/env bash

set -e # exit when error

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'master' ]; then
  printf "Release: You must be on master"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  printf "Release: Working tree is not clean (git status)"
  exit 1
fi

printf "\n\nRelease: update working tree"
git pull origin master

printf "\n\nRelease: merge develop branch"
git fetch origin develop
git merge origin/develop

printf "Release: npm install"
npm install

currentVersion=`cat package.json | json version`

# header
printf "\n\nRelease: current version is $currentVersion"
printf "\nRelease: a changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nRelease: you must choose a new ve.rs.ion (semver)"
printf "\nRelease: press q to exit the next screen\n\n"

# preview changelog
read -p "=> Release: press [ENTER] to view changes since latest version.."

# nd (markdown renderer in terminal)
# has some output going on to stderr because of node v4, no big deal
conventional-changelog -p angular | nd | less -r 2>/dev/null

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
conventional-changelog -p angular -i CHANGELOG.md -w

# regenerate readme TOC
printf "\n\nRelease: generate README.mc TOC"
npm run doctoc

# git add and tag
commitMessage="v$newVersion\n\n$changelog"
git add lib/version.js npm-shrinkwrap.json package.json CHANGELOG.md README.md
printf "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nRelease: almost done, check everything in another terminal tab.\n"
read -p "=> Release: when ready, press [ENTER] to push to github and publish the package"

printf "\n\nRelease: push to github, publish on npm"
git push
git push --tags
npm publish
git checkout develop
git pull
git merge master
git push

printf "\n\nRelease: update http://algolia.github.io/instantsearch.js with example/"
npm run gh-pages

printf "\n\nRelease: done! Flush the jsDelivr cache when the PR is merged: http://www.jsdelivr.com/\n"
