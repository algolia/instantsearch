const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  libraryName: 'algoliasearch-helper',
  templateName: 'javascript-helper-2.x',
  supportedVersion: '>= 2.0.0 < 3.0.0',
  appName: 'javascript-helper-app',
  keywords: ['algolia', 'JavaScript', 'Helper', 'algoliasearch-helper'],
  tasks: {
    install,
    teardown,
  },
};
