/* eslint-disable import/no-commonjs */
const fs = require('fs');
const path = require('path');

const packages = [
  'packages/react-instantsearch-core',
  'packages/react-instantsearch-dom-maps',
  'packages/react-instantsearch-dom',
  'packages/react-instantsearch-native',
  'packages/react-instantsearch',
];

module.exports = {
  monorepo: {
    mainVersionFile: 'lerna.json',
    packagesToBump: packages,
    packagesToPublish: packages,
  },
  versionUpdated: ({ version, exec, dir }) => {
    // write to `packages/react-instantsearch-core/src/core/version.js`
    fs.writeFileSync(
      path.resolve(
        dir,
        'packages',
        'react-instantsearch-core',
        'src',
        'core',
        'version.js'
      ),
      `export default '${version}';\n`
    );

    // update version in top level package
    exec(`mversion ${version}`);

    // update version in packages & dependencies
    exec(`lerna version ${version} --no-git-tag-version --no-push --yes`);
  },
  shouldPrepare: ({ releaseType, commitNumbersPerType }) => {
    const { fix = 0 } = commitNumbersPerType;
    if (releaseType === 'patch' && fix === 0) {
      return false;
    }
    return true;
  },
  pullRequestTeamReviewers: ['instantsearch-for-websites'],
  buildCommand: ({ version }) =>
    `NODE_ENV=production VERSION=${version} yarn build`,
  // afterPublish: async ({ exec, version }) => {
  //   await waitUntil(() => {
  //     return (
  //       exec(`npm view react-instantsearch@${version}`)
  //         .toString()
  //         .trim() !== ''
  //     );
  //   });
  //   exec('node scripts/update-examples.js');
  // },
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
      pretext: [`:tada: Successfully released *${appName}@${version}*`].join(
        '\n'
      ),
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

// function waitUntil(checkFn) {
//   return new Promise(resolve => {
//     const intervalId = setInterval(async () => {
//       if (await checkFn()) {
//         clearInterval(intervalId);
//         resolve();
//       }
//     }, 3000);
//   });
// }
