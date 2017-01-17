#!/usr/bin/env bash

set -e # exit when error

yarn boot &&
NODE_ENV=production yarn docs:build &&
babel-node scripts/gh-pages.js
