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
    releaseStart: null,
  },
};
