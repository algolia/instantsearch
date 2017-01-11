#!/usr/bin/env bash

# Use this script to install dependencies of every packages

yarn &&
(cd packages/react-instantsearch && yarn) &&
(cd packages/react-instantsearch-theme-algolia && yarn) &&
(cd packages/react-instantsearch/examples/autocomplete && yarn) &&
(cd packages/react-instantsearch/examples/multi-index && yarn) &&
(cd packages/react-instantsearch/examples/react-native && yarn) &&
(cd packages/react-instantsearch/examples/react-router && yarn)
