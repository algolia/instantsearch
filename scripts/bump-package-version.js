/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

import mversion from 'mversion';

import semver from 'semver';
import currentVersion from '../src/lib/version';

if (!process.env.VERSION) {
  throw new Error(
    'release: Usage is VERSION=MAJOR.MINOR.PATCH npm run release'
  );
}
const newVersion = process.env.VERSION;

if (!semver.valid(newVersion)) {
  throw new Error(
    `release: Provided new version (${newVersion}) is not a valid version per semver`
  );
}

if (semver.gte(currentVersion, newVersion)) {
  throw new Error(`release:
    Provided new version is not higher than current version (${newVersion} <= ${currentVersion})`);
}

console.log(`Releasing ${newVersion}`);

console.log('..Updating src/lib/version.js');

const versionFile = path.join(__dirname, '../src/lib/version.js');
const newContent = `export default '${newVersion}';\n`;
fs.writeFileSync(versionFile, newContent);

console.log('..Updating package.json, npm-shrinwrap.json');

mversion.update(newVersion);
