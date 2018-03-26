#!/usr/bin/env bash

# The release script has been updated in order to force the beta release for the
# v5. Before merging the branch to master we should revert the changes. In all the
# file there are some comment to revert.

set -e # exit when error

beta=false
if [ $# -gt 0 ]; then
  case "$1" in
    --beta)
      beta=true
      ;;
    *)
      printf "Usage: npm run release -- --beta\n";
      exit 1;
      ;;
  esac
fi

# npm owner add and npm whoami cannot be moved to yarn yet
if [[ $(cd packages/react-instantsearch && npm owner ls) != *"$(npm whoami)"* ]]; then
  printf "Release: Not an owner of the npm ris repo, ask for it\n"
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

# printf "\n\nRelease: update working tree"
git pull origin master
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

additionalInfo=''
if $beta; then
  additionalInfo='. You are releasing a BETA version. New version should look like x.x.x-beta.x.'
fi

# choose and bump new version
printf "\n=> Release: please type the new chosen version $additionalInfo >"
read -e newVersion

(
cd packages/react-instantsearch
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

git push origin master
git push origin --tags

printf "\n\nRelease: pushed to github, publish on npm"

npmFlags=''
if $beta; then
  npmFlags="--tag beta"
fi

(
cd packages/react-instantsearch
VERSION=$newVersion npm run build-and-publish -- -n "$npmFlags"
)

printf "\n\nRelease: Package was published to npm."

for d in examples/* ; do
    cd $d
    yarn upgrade react-instantsearch@$newVersion
    cd ../..
done

commitMessage="chore(deps): update examples to react-instantsearch v$newVersion"
git add .
printf "$commitMessage" | git commit --file -

printf "\n\nUpdate of react-instantsearch version in all examples\n"
printf "\n\nalmost done, check everything in another terminal tab if you want."

read -p "=> Update of react-instantsearch version in all examples: when ready, press [ENTER] to push to github"

git push origin master
