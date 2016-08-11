#!/usr/bin/env bash

set -e # exit when error

printf "
Launching dev environment
"

cd docs/
npm install
npm start
