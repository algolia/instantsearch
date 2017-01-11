#!/usr/bin/env bash

set -e # exit when error

NODE_ENV=production yarn docs:build && babel-node scripts/gh-pages.js
