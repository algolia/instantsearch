#!/usr/bin/env bash

set -ev # exit when error

npm test
npm prune
npm shrinkwrap --dev
./scripts/validate-commit-msgs.sh
