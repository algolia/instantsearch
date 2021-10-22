#!/usr/bin/env bash

echo "Cache current version of algoliasearch"
current_algoliasearch_version=$(cat package.json | grep -r '"algoliasearch"' | cut -d '"' -f4)
current_client_search_version=$(cat package.json | grep -r '"@algolia/client-search"' | cut -d '"' -f4)

echo "Update algoliasearch to v3 version"
# Remove algoliasearch latest
yarn remove @algolia/client-search >/dev/null

# Install algoliasearch v3
yarn add @types/algoliasearch@3.34.10 algoliasearch@3.35.1 >/dev/null

echo "Run type check on algoliasearch v3"
# Now that instantsearch.js uses algoliasearch v3. Run the related type-check
yarn run type-check:v3

echo "Rollback to previous algoliasearch version"
## Rollback to previous algoliasearch version

# remove obsolete types file
yarn remove @types/algoliasearch algoliasearch >/dev/null

# Install previous algoliasearch packages.
yarn add algoliasearch@$current_algoliasearch_version --dev >/dev/null
yarn add @algolia/client-search@$current_client_search_version --dev >/dev/null

echo "Run type check on algoliasearch v4 to ensure successful execution of the script"
# Run type-check to ensure the execution of the script was successful.
yarn run type-check
