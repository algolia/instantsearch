/* eslint-disable import/no-commonjs */
const shell = require('shelljs');

const packages = JSON.parse(
  shell.exec('yarn run --silent lerna list --toposort --no-private --json', {
    silent: true,
  })
);
const cwd = process.cwd();

module.exports = {
  monorepo: {
    mainVersionFile: 'package.json',
    // no packages should be versioned by shipjs, lerna should do it!
    packagesToBump: [],
    packagesToPublish: packages.map(({ location }) =>
      location.replace(`${cwd}/`, '')
    ),
  },
  shouldPrepare: ({ releaseType, commitNumbersPerType }) => {
    const { fix = 0 } = commitNumbersPerType;
    if (releaseType === 'patch' && fix === 0) {
      return false;
    }
    return true;
  },
  versionUpdated: () => {
    shell.exec('yarn lerna version --no-git-tag-version --no-push');
  },
  pullRequestTeamReviewers: ['frontend-experiences-web'],
  buildCommand: () => 'NODE_ENV=production yarn build --ignore="example-*"',
  beforeCommitChanges: () => {
    shell.exec('yarn run doctoc');
  },
  slack: {
    // disable slack notification for `prepared` lifecycle.
    // Ship.js will send slack message only for `releaseSuccess`.
    prepared: null,
    releaseSuccess: ({
      appName,
      version,
      tagName,
      latestCommitHash,
      latestCommitUrl,
      repoURL,
    }) => ({
      pretext: [
        `:tada: Successfully released *${appName}@${version}*`,
        '',
        `Make sure to run \`yarn run release-templates\` in \`create-instantsearch-app\`.`,
      ].join('\n'),
      fields: [
        {
          title: 'Branch',
          value: 'master',
          short: true,
        },
        {
          title: 'Commit',
          value: `*<${latestCommitUrl}|${latestCommitHash}>*`,
          short: true,
        },
        {
          title: 'Version',
          value: version,
          short: true,
        },
        {
          title: 'Release',
          value: `${repoURL}/releases/tag/${tagName}`,
        },
      ],
    }),
  },
};
