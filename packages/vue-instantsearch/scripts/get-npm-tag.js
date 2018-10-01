#!/usr/bin/env node
/* eslint-disable import/no-commonjs */
/* eslint-disable no-console */
const { version } = require('../package.json');

const getReleaseTag = _version => {
  const [match = 'latest'] = _version.match(/[a-z]+/) || [];
  return match;
};

process.stdout.write(getReleaseTag(version));
