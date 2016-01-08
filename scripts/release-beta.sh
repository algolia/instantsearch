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

currentBetaVersion=`cat .beta-version`
currentVersion=`cat package.json | json version`

# header
printf "\n\nBeta release: current beta: $currentBetaVersion, current stable: $currentVersion"
printf "\nBeta release: a changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nBeta release: you must choose a new ve.rs.ion (semver)"
printf "\nBeta release: press q to exit the next screen\n\n"

# preview changelog
read -p "=> Beta release: press [ENTER] to view changes since latest stable version.."

# nd (markdown renderer in terminal)
# has some output going on to stderr because of node v4, no big deal
conventional-changelog -p angular | nd | less -r 2>/dev/null

# choose and bump new version
# printf "\n\nBeta release: Please enter the new chosen version > "
printf "\n=> Beta release: please type the new chosen version > "
read -e newVersion

VERSION=$newVersion babel-node ./scripts/bump-package-version.js
echo $newVersion > .beta-version

# build new version
NODE_ENV=production VERSION=$newVersion npm run build

# add a timestamp fake file to dist/ to avoid having beta released published to jsdelivr automatically
# https://github.com/jsdelivr/jsdelivr/pull/8107#issuecomment-159562676
# You will have to close the open PR afterwards
timestamp=$(date "+%Y.%m.%d-%H.%M.%S")
tmpfile="dist/avoid-jsdelivr-beta-publish-$timestamp"
touch $tmpfile

printf "\n\nBeta release: almost done, check everything in another terminal tab.\n"
read -p "=> Beta release: when ready, press [ENTER] to push to github and publish the package to the beta channel"

# git add and tag
commitMessage="v$newVersion"
git add .beta-version
git tag "v$newVersion"
printf "$commitMessage" | git commit --file -

printf "\n\nBeta release: push to github, publish on npm"
git push origin develop
git push origin --tags
npm dist-tag add instantsearch.js@$newVersion beta
rm $tmpfile
git checkout .
