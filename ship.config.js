/* eslint-disable import/no-commonjs */
const fs = require('fs');
const path = require('path');

module.exports = {
  shouldPrepare: ({ releaseType, commitNumbersPerType }) => {
    const { fix = 0 } = commitNumbersPerType;
    if (releaseType === 'patch' && fix === 0) {
      return false;
    }
    return true;
  },
  versionUpdated: ({ version, dir }) => {
    fs.writeFileSync(
      path.resolve(dir, 'src', 'lib', 'version.ts'),
      `export default '${version}';\n`
    );
  },
  beforeCommitChanges: ({ exec }) => {
    exec('yarn doctoc');
  },
  pullRequestTeamReviewers: ['instantsearch-for-websites'],
  buildCommand: ({ version }) =>
    `NODE_ENV=production VERSION=${version} yarn build`,
  afterPublish: ({ exec, version, releaseTag }) => {
    if (releaseTag === 'latest' && version.startsWith('4.')) {
      exec('./scripts/release/build-experimental-typescript.js');
      exec(
        `yarn publish --no-git-tag-version --non-interactive --tag experimental-typescript`
      );
    }
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
