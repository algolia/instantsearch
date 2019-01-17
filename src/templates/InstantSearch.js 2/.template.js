const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  libraryName: 'instantsearch.js',
  templateName: 'instantsearch.js-2.x',
  supportedVersion: '>= 2.0.0 < 3.0.0',
  appName: 'instantsearch.js-app',
  keywords: ['algolia', 'InstantSearch', 'Vanilla', 'instantsearch.js'],
  tasks: {
    install,
    teardown,
  },
};
