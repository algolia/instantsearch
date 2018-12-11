#!/bin/bash

set -e # exit when error

mkdir -p dist

echo "➡️  Installing dependencies"

(cd docgen && yarn) & yarn
wait

echo "➡️  Starting library dev server [ http://localhost:8080 ]"
echo "➡️  Starting documentation dev server [ http://localhost:3000 ]"

(cd docgen && yarn dev) & NODE_ENV=development webpack-dev-server --config storybook/webpack.config.js
wait
