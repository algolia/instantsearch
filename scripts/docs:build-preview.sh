#!/usr/bin/env bash

NODE_ENV=production yarn docs:build &&
mv docs-production/react/_redirects docs-production/_redirects && # This is necessary so that the deployed preview lives at /react/
rm -f preview.zip &&
zip -r -9 preview.zip docs-production/
