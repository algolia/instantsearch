/* eslint-disable no-console, import/no-commonjs */

const fs = require('fs');
const path = require('path');
const mversion = require('mversion');
const semver = require('semver');
const { version: currentVersion } = require('../../package.json');

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

if (
  semver.gte(currentVersion, newVersion) &&
  // In SemVer `X.Y.Z-prerelease` < `X.Y.Z`, but we sometimes need to publish
  // an experimental release based on a stable release (like v4.X.X-experimental-xxx)
  semver.diff(newVersion, currentVersion) !== 'prerelease'
) {
  throw new Error(`release:
    Provided new version is not higher than current version (${newVersion} <= ${currentVersion})`);
}

console.log(`Releasing ${newVersion}`);

console.log('..Updating src/lib/version.ts');

const versionFile = path.join(__dirname, '../../src/lib/version.ts');
const newContent = `export default '${newVersion}';\n`;
fs.writeFileSync(versionFile, newContent);

console.log('..Updating package.json, npm-shrinwrap.json');

mversion.update(newVersion);
