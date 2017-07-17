#!/usr/bin/env bash

# Use this script to interactively upgrade all dependencies

yarn upgrade-interactive &&
(cd packages/react-instantsearch && yarn upgrade-interactive) &&
(cd packages/react-instantsearch-theme-algolia && yarn upgrade-interactive) &&
(cd packages/react-instantsearch/examples/autocomplete && npm-check -u) &&
(cd packages/react-instantsearch/examples/geo-search && npm-check -u) &&
(cd packages/react-instantsearch/examples/next-app && npm-check -u) &&
(cd packages/react-instantsearch/examples/multi-index && npm-check -u) &&
(cd packages/react-instantsearch/examples/react-native && npm-check -u) &&
(cd packages/react-instantsearch/examples/react-router && npm-check -u) &&
(cd packages/react-instantsearch/examples/react-router-v4 && npm-check -u) &&
(cd packages/react-instantsearch/examples/server-side-rendering && npm-check -u)
