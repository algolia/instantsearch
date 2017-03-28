#!/usr/bin/env bash

npmFlags=''
while getopts 'n:y:' flag; do
  case "${flag}" in
    n) npmFlags="${OPTARG}" ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done

yarn build &&
cd dist/ &&
npm publish $npmFlags &&
rm -rf dist/
