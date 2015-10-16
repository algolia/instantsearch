#!/usr/bin/env bash

set -ev # exit when error

npm test
npm shrinkwrap --dev
./scripts/validate-commit-msgs.sh
