#!/bin/sh
set -e

vue-demi-switch 3
VUE_VERSION=vue3 rollup -c
cp ./scripts/es-index-template.js dist/vue3/es/index.js
