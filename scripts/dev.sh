#!/bin/bash

set -e # exit when error

mkdir -p dist

echo "➡️  Installing dependencies"

(cd docgen && yarn) & yarn
wait

echo "➡️  Starting library dev server [ http://localhost:6006 ]"
echo "➡️  Starting documentation dev server [ http://localhost:3000 ]"

(cd docgen && yarn dev) & yarn run docs:storybook
wait
