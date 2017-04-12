#!/usr/bin/env bash

set -ev # exit when error

cd docgen && yarn && yarn start &
npm run dev &
wait
