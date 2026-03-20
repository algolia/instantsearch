const install = require('../../tasks/node/install.cjs');
const teardown = require('../../tasks/node/teardown.cjs');

module.exports = {
  libraryName: 'algoliasearch',
  templateName: 'javascript-client',
  appName: 'javascript-client-app',
  keywords: ['algolia', 'JavaScript', 'Client', 'algoliasearch'],
  tasks: {
    install,
    teardown,
  },
};
