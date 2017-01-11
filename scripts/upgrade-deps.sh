#!/usr/bin/env bash

# Use this script to interactively upgrade all dependencies

yarn upgrade-interactive &&
(cd packages/react-instantsearch && yarn upgrade-interactive) &&
(cd packages/react-instantsearch-theme-algolia && yarn upgrade-interactive) &&
(cd packages/react-instantsearch/examples/autocomplete && yarn upgrade-interactive) &&
(cd packages/react-instantsearch/examples/multi-index && yarn upgrade-interactive) &&
(cd packages/react-instantsearch/examples/react-native && yarn upgrade-interactive) &&
(cd packages/react-instantsearch/examples/react-router && yarn upgrade-interactive)
