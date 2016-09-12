#!/usr/bin/env bash

# Use this script to regenerate AUTHORS file from time to time,
# you will need some cleaning because of duplicates

set -ev

git shortlog -se \
| awk '{$1=""; sub(" ", ""); print}' \
| awk -F'<' '!x[$1]++' \
| awk -F'<' '!x[$2]++' \
> AUTHORS
