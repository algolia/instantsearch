#!/usr/bin/env bash

set -e # exit when error

NODE_ENV=production npm run docs:build && babel-node scripts/gh-pages.js
