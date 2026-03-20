const install = require('../../tasks/node/install.cjs');
const teardown = require('../../tasks/node/teardown.cjs');

module.exports = {
  libraryName: 'algoliasearch-helper',
  templateName: 'javascript-helper',
  supportedVersion: '>= 3.0.0 < 4.0.0',
  appName: 'javascript-helper-app',
  keywords: ['algolia', 'JavaScript', 'Helper', 'algoliasearch-helper'],
  tasks: {
    install,
    teardown,
  },
};
