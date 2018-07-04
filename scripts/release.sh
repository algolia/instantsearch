#!/usr/bin/env bash

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
for package in packages/* ; do
  if [[ $(cd $package && npm owner ls) != *"$(npm whoami)"* ]]; then
    printf "Release: Not an owner of \"$package\", ask for it\n"
    exit 1
  fi
done

currentBranch=`git rev-parse --abbrev-ref HEAD`
if [ $currentBranch != 'master' ]; then
  printf "Release: You must be on master\n"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  printf "Release: Working tree is not clean (git status)\n"
  exit 1
fi

printf "Release: update working tree\n"
git pull origin master
git fetch origin --tags

printf "\nRelease: install dependencies\n"
yarn

currentVersion=`cat package.json | json version`

# header
printf "\nRelease: current version is %s" $currentVersion
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
printf "\n=> Release: please type the new chosen version $additionalInfo > "

read -e newVersion

printf "\n"

if [[ "$newVersion" == "" ]]; then
  printf "\nRelease: The version must be provided\n"
  exit 1
fi

versionFilePath='packages/react-instantsearch-core/src/core/version.js'
if [[ ! -f "$versionFilePath" ]]; then
  printf "\nRelease: Unable to bump the version at:\n"
  printf "$versionFilePath\n"
  exit 1
fi

# update version in source file
echo "export default '$newVersion';" > $versionFilePath;

# update version in top level package
mversion $newVersion

printf "\n"

# update version in packages & dependencies
lerna publish \
  --scope react-* \
  --repo-version $newVersion \
  --skip-git \
  --skip-npm \
  --yes

# update changelog
printf "\nRelease: update changelog\n"
changelog=`conventional-changelog -p angular`
conventional-changelog --preset angular --infile CHANGELOG.md --same-file

# regenerate readme TOC
printf "\nRelease: generate TOCS\n"
yarn doctoc

# git add and tag
commitMessage="v$newVersion\n\n$changelog"
git add package.json lerna.json CHANGELOG.md README.md packages/ yarn.lock
printf "$commitMessage" | git commit --file -
git tag "v$newVersion"

printf "\n\nRelease: almost done, check everything in another terminal tab if you want.\n"
read -p "=> Release: when ready, press [ENTER] to push to github and publish the package"

git push origin master
git push origin --tags

printf "\n\nRelease: pushed to GitHub, publish on NPM\n"

if $beta
then
  VERSION=$newVersion lerna run release:beta --scope react-*
else
  VERSION=$newVersion lerna run release --scope react-*
fi

printf "\nRelease: Package was published to NPM\n\n"

# Wait for the publish to be effective
sleep 2.5

# Required until Lerna supports the top level package as a member
# of the Workspaces. Another solution is to move out the stories
# from the top level package (will be done at some point).
yarn upgrade react-instantsearch-dom@$newVersion -D
yarn upgrade react-instantsearch-dom-maps@$newVersion -D

for example in examples/* ; do
  (
    cd $example
    yarn upgrade react-instantsearch@$newVersion
  )
done

commitMessage="chore(deps): update examples to react-instantsearch v$newVersion"
git add .
printf "$commitMessage" | git commit --file -

printf "\n\nUpdate of react-instantsearch version in all examples\n"
printf "\n\nalmost done, check everything in another terminal tab if you want."

read -p "=> Update of react-instantsearch version in all examples: when ready, press [ENTER] to push to github"

git push origin master
