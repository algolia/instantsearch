const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

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
