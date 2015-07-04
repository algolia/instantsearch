#!/usr/bin/env bash

set -e # exit when error
set -x # debug messages

echo "Phantom test"

DEBUG=zuul* zuul --no-coverage --phantom -- test/run.js
