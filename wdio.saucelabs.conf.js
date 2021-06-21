/* eslint-disable import/no-commonjs */

const { saucelabs } = require('instantsearch-e2e-tests');

exports.config = {
  ...saucelabs,
  reporters: [
    'spec',
    [
      'junit',
      {
        outputDir: `${__dirname}/junit/wdio`,
        outputFileFormat({
          cid,
          capabilities: { browserName, browserVersion },
        }) {
          return `results-${cid}.${browserName}-${browserVersion}.xml`;
        },
        addFileAttribute: true,
      },
    ],
  ],
};
