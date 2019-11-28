#!/usr/bin/env node

/* eslint-disable no-process-exit */
/* eslint-disable import/no-commonjs */
const childProcess = require('child_process');
const colors = require('colors/safe');
const inquirer = require('inquirer');
const shell = require('shelljs');

shell.fatal = true;

// Read CLI flags
const forceBeta = process.argv.includes('--beta');

const {
  updateChangelog,
  getChangelog,
  showChangelog,
} = require('./conventional-changelog.js');

// check if user can publish new version to npm
const ownersFound = parseFloat(
  shell.exec('npm owner ls | grep "`npm whoami` " | wc -l', {
    silent: true,
  })
);

if (ownersFound !== 1) {
  shell.echo(
    colors.red(`
    You are not an owner of the npm repository,
    ask for it before trying to bundle a release.

    Please also make sure you started the release
    process with 'npm run release' and not 'yarn run release'.
  `)
  );
  process.exit(1);
}

// check if branch is clean with all changes commited
const uncommitedChanges = shell
  .exec('git status --porcelain')
  .toString()
  .trim();

if (uncommitedChanges) {
  shell.echo(
    colors.red(`
    Working tree is not clean, please commit all your changes before release.
  `)
  );
  process.exit(1);
}

const currentBranch = shell
  .exec('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim();

// check if we are not on branch master or exit
if (currentBranch === 'master') {
  shell.echo(
    colors.red(`
    It's not possible to release a new version from the master branch.
    Please checkout any other branch:
      - develop: release new stable version
      - xxxxxxx: release new beta version
  `)
  );
  process.exit(1);
}

const strategy = currentBranch !== 'develop' || forceBeta ? 'beta' : 'stable';

// called if process aborted before publish,
// nothing is pushed nor published remove local changes
function rollback(newVersion) {
  if (strategy === 'stable') {
    // reset master
    shell.exec('git reset --hard origin/master');
    shell.exec('git checkout develop');
  } else {
    // remove last commit
    shell.exec('git reset --hard HEAD~1');
  }

  // remove local created tag
  shell.exec(`git tag -d v${newVersion}`);
  process.exit(1);
}

inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: colors.yellow.underline(
        `You are on "${currentBranch}" branch. Are you sure you want to release a ${
          strategy === 'stable' ? 'new stable' : 'beta'
        } version?`
      ),
      default: false,
    },
  ])
  .then(({ confirm }) => {
    if (!confirm) process.exit(0);

    if (strategy === 'stable') {
      // merge develop on master first
      // and start release from master branch
      shell.echo(colors.blue('Updating working tree'));
      shell.exec('git checkout master');
      shell.exec('git pull origin master');
      shell.exec('git fetch origin --tags');
      shell.exec('git fetch origin develop');
      shell.exec('git merge origin/develop');
    }

    shell.echo(colors.blue('Install dependencies'));
    shell.exec('yarn');

    const { version: currentVersion } = require('../../package.json');
    shell.echo(
      colors.blue(`
      - Current version is "${currentVersion}"
      - Changelog will be generated only if a fix/feat/performance/breaking is found in git log
      - You must choose a new ve.rs.ion (semver) ${
        strategy === 'beta' ? 'with -beta.x suffix' : ''
      }
    `)
    );

    showChangelog(shell);

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
        shell.echo(colors.blue(`Bump version to "${newVersion}"`));
        shell.exec(
          `VERSION=${newVersion} node ./scripts/release/bump-package-version.js`
        );

        // build library new version
        shell.echo(colors.blue('Building library new version'));
        shell.exec(`NODE_ENV=production VERSION=${newVersion} npm run build`);

        // update changelog
        shell.echo(colors.blue('Update changelog'));
        const changelog = getChangelog(shell);

        // regenerate README TOC
        shell.echo(colors.blue('Generate TOCS'));
        shell.exec('npm run doctoc');

        // regenerate yarn.lock
        shell.exec('yarn');

        // Update the changelog if stable
        if (strategy === 'stable') {
          updateChangelog(shell);
        }

        // git add and tag
        const commitMessage = `v${newVersion}\n\n${changelog}`;
        shell.exec(
          'git add src/lib/version.ts yarn.lock package.json CHANGELOG.md README.md CONTRIBUTING.md'
        );
        shell.exec(`git commit -m "${commitMessage}"`);
        // if tagged, it is not possible to generate a nice changelog without manual updates
        if (strategy === 'stable') {
          shell.exec(`git tag "v${newVersion}"`);
        }

        shell.echo(
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
            if (!publishNpm) return rollback(newVersion);

            shell.echo(colors.blue('Push to github, publish on npm'));
            if (strategy === 'stable') {
              // This command requires interactive TTY and therefore we have to use the native child_process module. https://github.com/shelljs/shelljs/wiki/FAQ#running-interactive-programs-with-exec
              // shell.exec('npm publish')
              try {
                childProcess.execFileSync('npm', ['publish'], {
                  stdio: 'inherit',
                });
              } catch (e) {
                return rollback(newVersion);
              }

              shell.exec('git push origin master');
              shell.exec('git push origin --tags');

              shell.exec('git checkout develop');
              shell.exec('git pull origin develop');
              shell.exec('git merge master');
              shell.exec('git push origin develop');
            } else {
              try {
                // shell.exec('npm publish --tag beta');
                childProcess.execFileSync('npm', ['publish', '--tag', 'beta'], {
                  stdio: 'inherit',
                });
              } catch (e) {
                return rollback(newVersion);
              }

              shell.exec(`git push origin ${currentBranch} --tags`);
            }

            return process.exit(0);
          });
      });
  })
  .catch(e => shell.echo(e));
