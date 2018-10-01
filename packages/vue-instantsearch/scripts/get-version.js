#!/usr/bin/env node
/* eslint-disable import/no-commonjs */
/* eslint-disable no-console */
const { version } = require('../package.json');

process.stdout.write(version);
