#!/usr/bin/env bash

set -ev # exit when error

(
  cd docgen
  yarn && yarn run dev
) & ./scripts/dev.sh
wait
