#!/usr/bin/env bash

set -e # exit when error

if [[ -n $(npm owner add `npm whoami`) ]]; then
  printf "Beta release: Not an owner of the npm repo, ask for it"
  exit 1
fi

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'develop' ]; then
  printf "Beta release: You must be on develop"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  printf "Beta release: Working tree is not clean (git status)"
  exit 1
fi

printf "\n\nBeta release: update working tree"
git pull origin develop
git fetch origin --tags

printf "Beta release: npm install"
npm install

currentVersion=`cat package.json | json version`

# header
printf "\n\nBeta release: current version is $currentVersion"
printf "\nBeta release: a changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nBeta release: you must choose a new ve.rs.ion (semver)"
printf "\nBeta release: press q to exit the next screen\n\n"

# preview changelog
read -p "=> Beta release: press [ENTER] to view changes since latest version.."

# nd (markdown renderer in terminal)
# has some output going on to stderr because of node v4, no big deal
conventional-changelog -p angular | nd | less -r 2>/dev/null

# choose and bump new version
# printf "\n\nBeta release: Please enter the new chosen version > "
printf "\n=> Beta release: please type the new chosen version (-beta will be automatically appended) > "
read -e newVersion
newVersion="$newVersion-beta"
VERSION=$newVersion babel-node ./scripts/bump-package-version.js

# build new version
NODE_ENV=production VERSION=$newVersion npm run build

# update changelog
printf "\n\nBeta release: update changelog"
changelog=`conventional-changelog -p angular`
conventional-changelog -p angular -i CHANGELOG.md -w

# regenerate readme TOC
printf "\n\nBeta release: generate README.mc TOC"
npm run doctoc

# regenerate widgets jsdoc
printf "\n\nBeta release: regenerate widgets jsdoc"
npm run jsdoc:widget

# git add and tag
commitMessage="v$newVersion\n\n$changelog"
git add src/lib/version.js npm-shrinkwrap.json package.json CHANGELOG.md README.md docs/_includes/widget-jsdoc
printf "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nBeta release: almost done, check everything in another terminal tab.\n"
read -p "=> Beta release: when ready, press [ENTER] to push to github and publish the package to the beta channel"

printf "\n\nBeta release: push to github, publish on npm"
git push origin develop
git push origin --tags
npm publish --tag beta
