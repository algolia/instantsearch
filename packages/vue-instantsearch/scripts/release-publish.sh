#!/bin/sh

set -eu

readonly CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != master ]; then
  read -n 1 -p "WARNING! You are not currently on the master branch. Are you sure you want to continue? [Y/n]" reply
  echo ""
  if [ "$reply" == "n" ]; then
    echo "Aborting..."
    exit 1
  fi
fi

if ! git diff-index --quiet HEAD --; then
  echo "Working tree is not clean, aborting..."
  exit 1
fi

if ! yarn run build; then
  echo "Failed to build dist files, aborting..."
  exit 1
fi

if ! yarn run test; then
  echo "Tests failed, aborting..."
  exit 1
fi

readonly PACKAGE_VERSION=$(scripts/get-version.js)

npm publish --tag=$(scripts/get-npm-tag.js)

git tag "v$PACKAGE_VERSION"

git push --tags

echo "Pushed package to npm, and also pushed 'v$PACKAGE_VERSION' tag to git repository."
