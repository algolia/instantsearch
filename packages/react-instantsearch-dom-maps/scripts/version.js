#!/usr/bin/env node
/* eslint-disable import/no-commonjs */

const fs = require('fs');
const path = require('path');

const package = require('../package.json');

package.peerDependencies['react-instantsearch-dom'] = package.version;

fs.writeFileSync(
  path.resolve(__dirname, '../package.json'),
  JSON.stringify(package, null, 2)
);
