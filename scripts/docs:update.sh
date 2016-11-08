#!/usr/bin/env bash

set -e # exit when error

NODE_ENV=production DOCS_MOUNT_POINT=/instantsearch.js/react/ DOCS_DIST=docs/react/ npm run docs:build &&
babel-node scripts/gh-pages.js
