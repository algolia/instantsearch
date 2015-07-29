#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var mversion = require('mversion');

if (!process.env.VERSION) {
  throw new Error('release: Usage is VERSION=MAJOR.MINOR.PATCH npm run release');
}

var semver = require('semver');
var currentVersion = require('../src/version.json');
var newVersion = process.env.VERSION;

if (!semver.valid(newVersion)) {
  throw new Error('release: Provided new version (' + newVersion + ') is not a valid version per semver');
}

if (semver.gte(currentVersion, newVersion)) {
  throw new Error('release: Provided new version is not higher than current version (' + newVersion + ' <= ' + currentVersion + ')');
}

console.log('Releasing ' + newVersion);

console.log('..Updating src/version.json');

fs.writeFileSync(path.join(__dirname, '../src/version.json'), '"' + newVersion + '"');

console.log('..Updating bower.json and package.json');

mversion.update(newVersion);
