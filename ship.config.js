const fs = require('fs');
const path = require('path');

module.exports = {
  monorepo: {
    mainVersionFile: 'lerna.json',
    // We rely on Lerna to bump our dependencies.
    packagesToBump: [],
    packagesToPublish: [
      'packages/react-instantsearch-core',
      'packages/react-instantsearch-dom-maps',
      'packages/react-instantsearch-dom',
      'packages/react-instantsearch-hooks',
      'packages/react-instantsearch-hooks-server',
      'packages/react-instantsearch-native',
      'packages/react-instantsearch',
    ],
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

    // Update version in packages and dependencies
    exec(
      `yarn lerna version ${version} --exact --no-git-tag-version --no-push --yes`
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
      version,
      tagName,
      latestCommitHash,
      latestCommitUrl,
      repoURL,
    }) => ({
      pretext: [
        `:tada: Successfully released *React InstantSearch v${version}*`,
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
