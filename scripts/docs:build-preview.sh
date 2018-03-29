#!/usr/bin/env bash

NODE_ENV=production yarn docs:build &&
mkdir -p docgen/docs-production/react-instantsearch/ &&
mv docgen/docs-production/react-instantsearch/_redirects docgen/docs-production/ # This is necessary so that the deployed preview lives at /react/
