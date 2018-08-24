#!/bin/bash

set -e # exit when error

BABEL_ENV=production babel -q index.js -o dist-es5-module/index.js --watch &
BABEL_ENV=production babel src -d dist-es5-module/src --ignore *-test.js --quiet --watch &
BABEL_ENV="production-es6" babel -q index.es6.js -o es/index.js --watch &
BABEL_ENV="production-es6" babel src -d es --ignore *-test.js --quiet --watch
