#!/bin/sh

set -eu

readonly CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != master ]; then
  echo "You must be on 'master' branch to publish a release, aborting..."
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

readonly PACKAGE_VERSION=$(< package.json grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[:space:]')

yarn publish

git tag "v$PACKAGE_VERSION"

git push --tags

echo "Pushed package to npm, and also pushed 'v$PACKAGE_VERSION' tag to git repository."
