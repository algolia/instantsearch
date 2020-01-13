/* eslint-disable import/no-commonjs */
const fs = require('fs');
const path = require('path');

module.exports = {
  mergeStrategy: { toSameBranch: ['master'] },
  versionUpdated: ({ version, dir }) => {
    fs.writeFileSync(
      path.resolve(dir, 'src', 'lib', 'version.ts'),
      `export default '${version}';\n`
    );
  },
  beforeCommitChanges: ({ exec }) => {
    exec('yarn doctoc');
  },
  pullRequestReviewer: ['@algolia/instantsearch-for-websites'],
  slack: {
    // disable slack notification for `prepared` and `releaseStart` lifecycle.
    // Ship.js will send slack message only for `releaseSuccess`.
    prepared: null,
    releaseStart: null,
    releaseSuccess: ({
      appName,
      version,
      releaseTag,
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
          value: `${repoURL}/releases/tag/${releaseTag}`,
        },
      ],
    }),
  },
};
