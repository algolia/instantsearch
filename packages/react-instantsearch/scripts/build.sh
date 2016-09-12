#!/usr/bin/env bash

set -e # exit when error

mkdir -p dist/
rm -rf dist/*
cp package.json dist/
cp README.md dist/
babel -q index.js -o dist/index.js
babel -q --out-dir dist/src src
