#!/usr/bin/env bash

set -ev # exit when error

yarn
yarn run doc
surge documentation
