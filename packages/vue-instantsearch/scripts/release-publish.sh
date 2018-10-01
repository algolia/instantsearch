#!/bin/sh

set -eu

readonly CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != master ]; then
  echo "You must be on 'master' branch to publish a release, aborting..."
  exit 1
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
