#!/usr/bin/env node

/* eslint no-process-exit: off */

'use strict';

const prompt = require('prompt');
const semver = require('semver');
const mversion = require('mversion');
const argv = require('yargs').argv;
const path = require('path');
const fs = require('fs');

const shell = require('shelljs');
shell.fatal = true;

const colors = require('colors');
colors.setTheme({
  error: 'red',
  info: 'green',
});

const packageJson = require('../package.json');

const {
  showChangelog,
  getChangelog,
  updateChangelog,
} = require('./lib/conventionalChangelog');

const { canary: isCanary } = argv;

if (isCanary) {
  releaseCanaryVersion();
} else {
  releaseStableVersion();
}

function releaseCanaryVersion() {
  shell.echo(`Algolia JS Helper release CANARY version`);

  checkCleanWorkdir();
  updateCanaryVersion((canaryVersion) => {
    build();
    publishOnNpm('canary');
    revertStableVersion(packageJson.version, () => {
      shell.echo(`Algolia JS Helper v${canaryVersion} released`);
    });
  });
}

function releaseStableVersion() {
  shell.echo(`Algolia JS Helper release STABLE version`);

  checkDevelopBranch();
  checkCleanWorkdir();
  mergeDevIntoMaster();
  showChangelog(shell);
  promptVersion(packageJson.version, (version) => {
    bumpVersion(version, () => {
      build();
      updateChangelog(shell);
      commitNewFiles(version);
      publish();
      goBackToDevelop();

      shell.echo(`Algolia JS Helper v${version} released`);
    });
  });
}

function checkDevelopBranch() {
  const currentBranch = shell
    .exec('git rev-parse --abbrev-ref HEAD', { silent: true })
    .toString()
    .trim();

  if (currentBranch !== 'develop') {
    shell.echo('The release script should be started from develop'.error);
    process.exit(1);
  }
}

function checkCleanWorkdir() {
  const changes = shell
    .exec('git status --porcelain', { silent: true })
    .toString()
    .trim();

  if (changes.length > 0) {
    shell.echo('The project has some uncommited changes'.error);
    process.exit(1);
  }
}

function mergeDevIntoMaster() {
  shell.echo('Merging develop into master');

  shell.exec('git fetch origin', { silent: true });
  shell.exec('git merge origin develop', { silent: true });
  shell.exec('git checkout master', { silent: true });
  shell.exec('git merge origin master', { silent: true });
  shell.exec('git merge --no-ff --no-edit develop', { silent: true });
}

function promptVersion(currentVersion, cb) {
  shell.echo(`Current version is ${packageJson.version.toString().green.bold}`);

  prompt.message = '?'.info;
  prompt.colors = false;
  prompt.start();
  prompt.get(
    [
      {
        description: 'Enter the next version based on the changelog',
        required: true,
        conform: function (nextVersion) {
          return (
            semver.valid(nextVersion) && semver.gte(nextVersion, currentVersion)
          );
        },
        message:
          `The version must conform to semver (MAJOR.MINOR.PATCH) and be greater than the current version (${currentVersion.bold}).`
            .error,
      },
    ],
    function (err, result) {
      if (err) {
        shell.echo('\nCannot read the next version'.error);
        process.exit(1);
      }

      cb(result.question);
    }
  );
}

function bumpVersion(newVersion, cb) {
  shell.echo(`Updating files to version: ${newVersion}`);
  shell.echo('..src/version.js');

  var versionFile = path.join(__dirname, '../src/version.js');
  var newContent = "'use strict';\n\nmodule.exports = '" + newVersion + "';\n";
  fs.writeFileSync(versionFile, newContent);

  shell.echo('..package.json');

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
  shell.exec(`git commit -a -m "${changelog.join('\n')}"`, { silent: true });

  shell.echo('Creating tag');
  shell.exec(`git tag ${version}`, { silent: true });
}

function publish() {
  shell.echo('Pushing new commits to GitHub');
  shell.exec('git push origin', { silent: true });
  shell.exec('git push origin --tags', { silent: true });

  publishOnNpm('latest');

  shell.echo('Publishing new documentation');
  shell.exec('yarn run doc:publish');
}

function publishOnNpm(tag) {
  shell.echo('Publishing new version on npm');
  shell.exec(`npm publish --tag ${tag}`, { silent: true });
}

function goBackToDevelop() {
  shell.echo('Merging back to develop');
  shell.exec('git checkout develop && git merge --no-edit master', {
    silent: true,
  });

  shell.echo('Pushing the merge to GitHub');
  shell.exec('git push origin develop', { silent: true });
}

function build() {
  shell.exec('yarn run build');
}

function updateCanaryVersion(cb) {
  const lastCommitHash = shell
    .exec('git rev-parse --short HEAD', { silent: true })
    .toString()
    .trim();
  const canaryVersion = `0.0.0-${lastCommitHash}`;

  bumpVersion(canaryVersion, () => {
    cb(canaryVersion);
  });
}

function revertStableVersion(version, cb) {
  bumpVersion(version, cb);
}
