#! /usr/bin/env bash

if [ CI != 'true' ]; then
  printf "finish-release: Only doable on CI\n"
  printf "finish-release: You can also manually update gh-pages and clear the cdn cache if needed"
  exit 1
fi

set -ev # exit when error

VERSION=`cat package.json | json version`
JSDELIVER_URL="http://cdn.jsdelivr.net/instantsearch.js/$VERSION/instantsearch.min.js"

while true; do
  STATUS=$(curl -L -I $JSDELIVER_URL 2>/dev/null | head -n 1 | cut -d$' ' -f2);
  if [ STATUS == '200' ]; then
    # was merged and published to jsdelivr
    break;
  else
    echo "$JSDELIVER_URL returned status $STATUS"
  fi
  sleep 30
done

curl -silent -L $CACHE_URL
npm run docs:update-website
