#!/usr/bin/env bash

yarn build &&
cd dist/ &&
npm publish &&
rm -rf dist/
