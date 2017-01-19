#!/usr/bin/env bash

# Use this script to install dependencies of every packages

yarn &&
(cd packages/react-instantsearch && yarn) &&
(cd packages/react-instantsearch-theme-algolia && yarn)
