#!/bin/bash

set -e # exit on error


echo "building via webpack"

yarn webpack --config website/webpack.config.js

echo "building via parcel"

(
  cd examples/hooks-e-commerce;
  yarn build --public-url /examples/hooks-e-commerce --dist-dir ../../website/examples/hooks-e-commerce;
)
