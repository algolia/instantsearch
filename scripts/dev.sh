#!/usr/bin/env bash

set -e # exit when error

npm run js:watch &
  http-server . &
  sleep 1 && echo "Open http://127.0.0.1:8080/examples/" &&
  wait
