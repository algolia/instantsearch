#!/usr/bin/env bash

npmFlags=''
yarnFlags=''
while getopts 'n:y:' flag; do
  case "${flag}" in
    n) npmFlags="${OPTARG}" ;;
    y) yarnFlags="${OPTARG}" ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done

yarn build $yarnFlags &&
cd dist/ &&
npm publish $npmFlags &&
rm -rf dist/
