#!/usr/bin/env bash

set -e # exit when error

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'master' ]; then
  printf "Release: You must be on master"
  exit 1
fi

[[ -z $(git status -s) ]] && printf "Release: Working tree is not clean (git status)" && exit 1

printf "\n\nRelease: update working tree"
git pull origin master

printf "\n\nRelease: merge develop branch"
git fetch origin/develop
git merge origin/develop

printf "Release: npm install"
npm install

currentVersion=`cat package.json | json version`

# header
printf "\n\nRelease: Current version is $currentVersion"
printf "\nRelease: A changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nRelease: You must choose a new ve.rs.ion (semver)"
printf "\nPress q to exit the next screen\n\n"

# preview changelog
read -p "=> Release: Press [ENTER] to view changes since latest version.."

# nd (markdown renderer in terminal)
# has some output going on to stderr because of node v4, no big deal
conventional-changelog -p angular | nd 2>/dev/null

# choose and bump new version
# printf "\n\nRelease: Please enter the new chosen version > "
printf "\n=> Release: Please enter the new chosen version > "
read newVersion
VERSION=$newVersion node ./scripts/bump-package-version.js

# build new version
VERSION=$newVersion npm run build

# update changelog
printf "\n\nRelease: Update changelog"
changelog=`conventional-changelog -p angular`
conventional-changelog -p angular -i CHANGELOG.md -w

# regenerate readme TOC
printf "\n\nRelease: Generate README.mc TOC"
npm run doctoc

# git add and tag
commitMessage="v$newVersion\n\n$changelog"
git add npm-shrinkwrap.json package.json CHANGELOG.md README.md
printf "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nRelease: Almost done, check everything in another terminal tab.\n"
read -p "=> Release: When ready, press [ENTER] to push to github and publish the package"

printf "\n\nRelease: Push to github, publish on npm"
git push
git push --tags
npm publish
git checkout develop
git pull develop
git merge master
git push

printf "\n\nRelease: done! Flush the jsDelivr cache when the PR is merged: http://www.jsdelivr.com/"
