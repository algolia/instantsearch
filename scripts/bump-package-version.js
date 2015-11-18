let fs = require('fs');
let path = require('path');

let mversion = require('mversion');

if (!process.env.VERSION) {
  throw new Error('release: Usage is VERSION=MAJOR.MINOR.PATCH npm run release');
}

let semver = require('semver');
let currentVersion = require('../src/lib/version.js');
let newVersion = process.env.VERSION;

if (!semver.valid(newVersion)) {
  throw new Error('release: Provided new version (' + newVersion + ') is not a valid version per semver');
}

if (semver.gte(currentVersion, newVersion)) {
  throw new Error('release: Provided new version is not higher than current version (' + newVersion + ' <= ' + currentVersion + ')');
}

console.log('Releasing ' + newVersion);

console.log('..Updating src/lib/version.js');

let versionFile = path.join(__dirname, '../src/lib/version.js');
let newContent = "module.exports = '" + newVersion + "';\n";
fs.writeFileSync(versionFile, newContent);

console.log('..Updating package.json, npm-shrinwrap.json');

mversion.update(newVersion);
