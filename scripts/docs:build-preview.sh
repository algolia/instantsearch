#!/usr/bin/env bash

NODE_ENV=production yarn docs:build &&
mkdir -p docs-production/react-instantsearch/ &&
mv docs-production/react-instantsearch/_redirects docs-production/ # This is necessary so that the deployed preview lives at /react/
