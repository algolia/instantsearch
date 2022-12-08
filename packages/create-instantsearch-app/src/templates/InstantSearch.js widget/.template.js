const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Widget',
  libraryName: 'instantsearch.js',
  supportedVersion: '>= 4.27.1 < 5.0.0',
  templateName: 'instantsearch.js-widget',
  packageNamePrefix: 'instantsearch-widget-',
  keywords: [
    'algolia',
    'InstantSearch',
    'Vanilla',
    'instantsearch.js',
    'widget',
  ],
  tasks: {
    install,
    teardown,
  },
};
