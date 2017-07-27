#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-disable no-process-exit */
/* eslint-disable import/no-commonjs */

const { execSync } = require('child_process');
const colors = require('colors/safe');
const inquirer = require('inquirer');

// check if user can publish new version to npm
try {
  execSync('$(npm owner add `npm whoami`)');
} catch (e) {
  console.log(
    colors.red(`
    You are not an owner of the npm repository,
    ask for it before trying to bundle a release.
  `)
  );
  process.exit(1);
}

// check if branch is clean with all changes commited
const uncommitedChanges = execSync('git status --porcelain').toString().trim();
if (uncommitedChanges) {
  console.log(
    colors.red(`
    Working tree is not clean, please commit all your changes before release.
  `)
  );
  process.exit(1);
}

const currentBranch = execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim();

// check if we are not on branch master or exit
if (currentBranch === 'master') {
  console.log(
    colors.red(`
    It's not possible to release a new version from the master branch.
    Please checkout any other branch:
      - develop: release new stable version
      - xxxxxxx: release new beta version
  `)
  );
  process.exit(1);
}

const strategy = currentBranch === 'develop' ? 'stable' : 'beta';

// called if process aborted before publish,
// nothing is pushed nor published remove local changes
function rollback(newVersion) {
  if (strategy === 'stable') {
    // reset master
    execSync('git reset --hard origin master');
    execSync('git checkout develop');
  } else {
    // remove last commit
    execSync('git reset --hard HEAD~1');
  }

  // remove local created tag
  execSync(`git tag -d v${newVersion}`);
  process.exit(1);
}

inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: colors.yellow.underline(
        `You are on "${currentBranch}" branch. Are you sure you want to release a ${strategy ===
        'stable'
          ? 'new stable'
          : 'beta'} version?`
      ),
      default: false,
    },
  ])
  .then(({ confirm }) => {
    if (!confirm) process.exit(0);

    if (strategy === 'stable') {
      // merge develop on master first
      // and start release from master branch
      console.log(colors.blue('Updating working tree'));
      execSync('git checkout master');
      execSync('git pull origin master');
      execSync('git fetch origin --tags');
      execSync('git fetch origin develop');
      execSync('git merge origin/develop');
    }

    console.log(colors.blue('Install dependencies'));
    execSync('yarn');

    const { version: currentVersion } = require('../package.json');
    console.log(
      colors.blue(`
      - Current version is "${currentVersion}"
      - Changelog will be generated only if a fix/feat/performance/breaking is found in git log
      - You must choose a new ve.rs.ion (semver) ${strategy === 'beta'
        ? 'with -beta.x suffix'
        : ''}
    `)
    );

    execSync(
      'conventional-changelog --preset angular --output-unreleased | less'
    );

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'newVersion',
          message: colors.blue.underline(
            strategy === 'stable'
              ? 'Please type the new chosen version'
              : 'Please type the new chosen version (with -beta.x suffix)'
          ),
          validate(newVersion) {
            return (
              strategy === 'stable' ||
              (newVersion && /-beta\.\d{1,}$/.test(newVersion)) ||
              'You must include `-beta.x` suffix in the version number'
            );
          },
        },
      ])
      .then(({ newVersion }) => {
        // bump new version
        console.log(colors.blue(`Bump version to "${newVersion}"`));
        execSync(
          `VERSION=${newVersion} babel-node ./scripts/bump-package-version.js`
        );

        // build library new version
        console.log(colors.blue('Building library new version'));
        execSync(`NODE_ENV=production VERSION=${newVersion} npm run build`);

        // update changelog
        console.log(colors.blue('Update changelog'));
        const changelog = execSync('conventional-changelog -p angular')
          .toString()
          .trim();

        execSync(
          'conventional-changelog --preset angular --infile CHANGELOG.md --same-file'
        );

        // regenerate README TOC
        console.log(colors.blue('Generate TOCS'));
        execSync('npm run doctoc');

        // regenerate yarn.lock
        execSync('yarn');

        // git add and tag
        const commitMessage = `v${newVersion}\n\n${changelog}`;
        execSync(
          'git add src/lib/version.js yarn.lock package.json CHANGELOG.md README.md CONTRIBUTING.md'
        );
        execSync(`git commit -m "${commitMessage}"`);
        execSync(`git tag "v${newVersion}"`);

        console.log(
          colors.yellow.underline(
            'Almost done, check everything in another terminal tab'
          )
        );

        inquirer
          .prompt([
            {
              type: 'confirm',
              name: 'publishNpm',
              message: colors.yellow.underline(
                'Is everything OK? Continue to push to github and publish the package?'
              ),
            },
          ])
          .then(({ publishNpm }) => {
            if (!publishNpm) rollback(newVersion);

            console.log(colors.blue('Push to github, publish on npm'));
            if (strategy === 'stable') {
              execSync('git push origin master');
              execSync('git push origin --tags');
              execSync('npm publish');
              execSync('git checkout develop');
              execSync('git pull origin develop');
              execSync('git merge master');
              execSync('git push origin develop');
            } else {
              execSync(`git push origin ${currentBranch}`);
              execSync('git push origin --tags');
              execSync('npm publish --tag beta');
            }

            console.log(
              colors.green(`
              Package was published to npm.
              A job on travis-ci will be automatically launched to finalize the release.
              `)
            );
          });
      });
  });
