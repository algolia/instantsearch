#!/usr/bin/env bash

set -e # exit when error

# npm owner add and npm whoami cannot be moved to yarn yet
if [[ -n $(cd packages/react-instantsearch && npm owner add "$(npm whoami)") ]]; then
  printf "Release: Not an owner of the npm repo, ask for it\n"
  exit 1
fi

if [[ -n $(cd packages/react-instantsearch-theme-algolia && npm owner add "$(npm whoami)") ]]; then
  printf "Release: Not an owner of the npm repo, ask for it\n"
  exit 1
fi

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'v2' ]; then
  printf "Release: You must be on v2\n"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  printf "Release: Working tree is not clean (git status)\n"
  exit 1
fi

# printf "\n\nRelease: update working tree"
git pull origin v2
git fetch origin --tags

# printf "Release: install dependencies"
yarn boot

# No need for complex release process for now, only patch releases should be ok
currentVersion=`cat package.json | json version`

# header
printf "\n\nRelease: current version is %s" $currentVersion
printf "\nRelease: a changelog will be generated only if a fix/feat/performance/breaking token is found in git log"
printf "\nRelease: you must choose a new ve.rs.ion (semver)"
printf "\nRelease: press q to exit the next screen\n\n"

# preview changelog
read -p "=> Release: press [ENTER] to view changes since latest version.."

conventional-changelog --preset angular --output-unreleased | less

# choose and bump new version
printf "\n=> Release: please type the new chosen version > "
read -e newVersion

(
cd packages/react-instantsearch
mversion $newVersion
)

(
cd packages/react-instantsearch-theme-algolia
mversion $newVersion
)

mversion $newVersion

# update changelog
printf "\n\nRelease: update changelog"
changelog=`conventional-changelog -p angular`
conventional-changelog --preset angular --infile CHANGELOG.md --same-file

# regenerate readme TOC
printf "\n\nRelease: generate TOCS"
yarn doctoc

# git add and tag
commitMessage="v$newVersion\n\n$changelog"
git add package.json CHANGELOG.md README.md packages/ yarn.lock
printf "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nRelease: almost done, check everything in another terminal tab if you want.\n"
read -p "=> Release: when ready, press [ENTER] to push to github and publish the package"

git push origin v2
git push origin --tags

printf "\n\nRelease: pushed to github, publish on npm"

(
cd packages/react-instantsearch
VERSION=$newVersion npm run build-and-publish
)

(
cd packages/react-instantsearch-theme-algolia
npm run build-and-publish
)

printf "Release:
Package was published to npm."
