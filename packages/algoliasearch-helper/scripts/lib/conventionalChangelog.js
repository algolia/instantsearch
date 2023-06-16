'use strict';

module.exports = {
  showChangelog,
  updateChangelog,
  getChangelog,
};

const colors = require('colors/safe');

const baseConvChangelog =
  'conventional-changelog --config scripts/conventional-changelog/';

function showChangelog(shell) {
  shell.echo(colors.yellow.underline('\nNext version changelog:'));
  const changelog = shell.exec(`${baseConvChangelog} -u`, {
    silent: true,
  }).stdout;
  shell.echo(colors.white(changelog));
}

function updateChangelog(shell) {
  shell.echo(colors.yellow('⚠️ Updating changelog'));
  shell.exec(`${baseConvChangelog} --infile CHANGELOG --same-file`, {
    silent: true,
  });
}

function getChangelog(shell) {
  const changelog = shell
    .exec(`${baseConvChangelog} -u`, { silent: true })
    .trim()
    .split('\n');
  changelog.splice(1, 0, '');
  return changelog;
}
