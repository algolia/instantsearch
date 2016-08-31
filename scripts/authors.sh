#!/usr/bin/env bash

set -ev

git shortlog -se \
| awk '{$1=""; sub(" ", ""); print}' \
| awk -F'<' '!x[$1]++' \
| awk -F'<' '!x[$2]++' \
> AUTHORS
