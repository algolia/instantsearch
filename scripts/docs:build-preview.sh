#!/usr/bin/env bash

NODE_ENV=production yarn docs:build &&
mkdir -p docs-production/instantsearch.js/ &&
mv docs-production/react/_redirects docs-production/ && # This is necessary so that the deployed preview lives at /react/
mv docs-production/react docs-production/instantsearch.js
