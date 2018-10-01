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

if ! yarn test; then
  echo "Tests failed, aborting..."
  exit 1
fi

yarn run changelog:unreleased

# Only update the package.json version
# We need to update changelog before tagging
# And publishing.
yarn version --no-git-tag-version

if ! yarn run changelog; then
  echo "Failed to update changelog, aborting..."
  exit 1
fi

readonly PACKAGE_VERSION=$(scripts/get-version.js)

git checkout -b "chore/release-$PACKAGE_VERSION"

# Gives user a chance to review and eventually abort.
git add --patch

git commit --message="chore(release): v${PACKAGE_VERSION}"

git push origin HEAD

echo "Your release branch 'chore/release-$PACKAGE_VERSION' is now ready for review..."

git open > /dev/null 2>&1 || echo "Install https://github.com/paulirish/git-open so that next times it opens the browser at the repository URL."
