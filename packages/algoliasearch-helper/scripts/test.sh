#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

echo "Test"

echo "Test: node"
./scripts/test-node.sh

echo "Test: phantom"
./scripts/test-phantom.sh

echo "Test: lint"
./scripts/lint.sh
