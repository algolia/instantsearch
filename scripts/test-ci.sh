#!/usr/bin/env bash

set -ev # exit when error

./scripts/validate-pr-done-on-develop.sh
npm test
npm prune
npm run shrinkwrap --dev
./scripts/validate-commit-msgs.sh
npm run build
