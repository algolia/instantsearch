#!/usr/bin/env node

/* eslint-disable import/no-commonjs */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const packageJsonPath = path.resolve('package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
const { version: currentVersion } = packageJson;
const newVersion = `${currentVersion}-experimental-typescript.0`;
packageJson.version = newVersion;
packageJson.types = 'es/index.d.ts';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

fs.writeFileSync(
  path.resolve('src', 'lib', 'version.ts'),
  `export default '${newVersion}';\n`
);

shell.exec(`NODE_ENV=production VERSION=${newVersion} yarn build`);
shell.exec('yarn build:types');
