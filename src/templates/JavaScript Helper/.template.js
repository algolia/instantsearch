const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  libraryName: 'algoliasearch-helper',
  templateName: 'javascript-helper',
  appName: 'javascript-helper-app',
  keywords: ['algolia', 'JavaScript', 'Helper', 'algoliasearch-helper'],
  tasks: {
    install,
    teardown,
  },
};
