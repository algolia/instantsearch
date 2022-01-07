const fs = require('fs');
const path = require('path');

const packages = [
  'packages/react-instantsearch-core',
  'packages/react-instantsearch-dom-maps',
  'packages/react-instantsearch-dom',
  'packages/react-instantsearch-hooks',
  'packages/react-instantsearch-hooks-server',
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
    // Update version in `react-instantsearch-core`
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
    // Update version in `react-instantsearch-hooks`
    fs.writeFileSync(
      path.resolve(
        dir,
        'packages',
        'react-instantsearch-hooks',
        'src',
        'version.ts'
      ),
      `export default '${version}';\n`
    );

    // update version in top level package
    exec(`mversion ${version}`);

    // update version in packages & dependencies
    exec(`lerna version ${version} --no-git-tag-version --no-push --yes`);

    // @TODO: We can remove after initial npm release of `react-instantsearch-hooks-server`
    // We update the Hooks and Hooks Server package dependency in the example because Lerna doesn't
    // and releasing fails because the Hooks Server package has not yet been released on npm.
    exec(
      `yarn workspace hooks-ssr-example upgrade react-instantsearch-hooks-server@${version}`
    );
  },
  shouldPrepare: ({ releaseType, commitNumbersPerType }) => {
    const { fix = 0 } = commitNumbersPerType;
    if (releaseType === 'patch' && fix === 0) {
      return false;
    }
    return true;
  },
  pullRequestTeamReviewers: ['frontend-experiences-web'],
  buildCommand: ({ version }) =>
    `NODE_ENV=production VERSION=${version} yarn build`,
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
