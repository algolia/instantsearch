const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  libraryName: 'instantsearch.js',
  templateName: 'instantsearch.js',
  appName: 'instantsearch.js-app',
  keywords: ['algolia', 'InstantSearch', 'Vanilla', 'instantsearch.js'],
  tasks: {
    install,
    teardown,
  },
};
