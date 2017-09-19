#!/usr/bin/env node
'use strict';

const prompt = require('prompt');
const semver = require('semver');
const mversion = require('mversion');
const path = require('path');
const fs = require('fs');

const shell = require('shelljs');
shell.fatal = true;

const colors = require('colors');
colors.setTheme({
  error: 'red',
  info: 'green'
});

const packageJson = require('../package.json');

const {showChangelog, getChangelog, updateChangelog} = require('./lib/conventionalChangelog.js');

shell.echo(`Algoliasearch-Helper release script`);

checkEnvironment();
mergeDevIntoMaster();
showChangelog(shell);
promptVersion(packageJson.version, (version) => {
  bumpVersion(version, () => {
    updateChangelog(shell);
    commitNewFiles(version);
    publish();
    goBackToDevelop();
  });
});

function checkEnvironment() {
  const currentBranch = shell.exec('git rev-parse --abbrev-ref HEAD', {silent: true}).toString().trim();

  if (currentBranch !== 'develop') {
    shell.echo('The release script should be started from develop'.error);
    process.exit(1);
  }

  const changes = shell.exec('git status --porcelain', {silent: true}).toString().trim();

  if (changes.length > 0) {
    shell.echo('The project has some uncommited changes'.error);
    process.exit(1);
  }
}

function mergeDevIntoMaster() {
  shell.echo('Merging develop into master');

  shell.exec('git fetch origin', {silent: true});
  shell.exec('git merge origin develop', {silent: true});
  shell.exec('git checkout master', {silent: true});
  shell.exec('git merge origin master', {silent: true});
  shell.exec('git merge --no-ff --no-edit develop', {silent: true});
}

function promptVersion(currentVersion, cb) {
  shell.echo(`Current version is ${packageJson.version.toString().green.bold}`);

  prompt.message = '?'.info;
  prompt.colors = false;
  prompt.start();
  prompt.get([{
    description: 'Enter the next version based on the changelog',
    required: true,
    conform: function(nextVersion) {
      return semver.valid(nextVersion) && semver.gte(nextVersion, currentVersion);
    },
    message: `The version must conform to semver (MAJOR.MINOR.PATCH) and be greater than the current version (${currentVersion.bold}).`.error
  }], function(err, result) {
    if (err) {
      shell.echo('\nCannot read the next version'.error);
      process.exit(1);
    }

    cb(result.question);
  });
}

function bumpVersion(newVersion, cb) {
  shell.echo('Updating files');
  shell.echo('..src/version.js');

  var versionFile = path.join(__dirname, '../src/version.js');
  var newContent = "'use strict';\n\nmodule.exports = '" + newVersion + "';\n";
  fs.writeFileSync(versionFile, newContent);

  shell.echo('..bower.json and package.json');

  mversion.update(newVersion, (err) => {
    if (err) {
      shell.echo('Unable to update files containing versions'.error);
      process.exit(1);
    }
    cb();
  });
}

function commitNewFiles(version) {
  shell.echo('Commiting files');
  const changelog = getChangelog(shell);
  changelog.splice(1, 0, '');
  shell.exec(`git commit -a -m "${changelog.join('\n')}"`, {silent: true});

  shell.echo('Creating tag');
  shell.exec(`git tag ${version}`, {silent: true});
}

function publish() {
  shell.echo('Pushing new commits to Github');
  shell.exec('git push origin', {silent: true});
  shell.exec('git push origin --tags', {silent: true});

  shell.echo('Publishing new version on NPM');
  shell.exec('npm publish', {silent: true});

  shell.echo('Publishing new documentation');
  shell.exec('yarn run doc:publish');
}

function goBackToDevelop() {
  shell.echo('Merging back to develop');
  shell.exec('git checkout develop && git merge --no-edit master', {silent: true});

  shell.echo('Pushing the merge to Github');
  shell.exec('git push origin develop', {silent: true});
}
