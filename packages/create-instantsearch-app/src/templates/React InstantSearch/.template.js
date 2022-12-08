const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Web',
  libraryName: 'react-instantsearch-dom',
  supportedVersion: '>= 5.0.0 < 7.0.0',
  flags: {
    dynamicWidgets: '>=6.16',
  },
  templateName: 'react-instantsearch',
  appName: 'react-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'React', 'react-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
