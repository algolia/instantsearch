const install = require('../../tasks/node/install.cjs');
const teardown = require('../../tasks/node/teardown.cjs');

module.exports = {
  category: 'Web',
  libraryName: 'react-instantsearch',
  supportedVersion: '>= 7.0.0 < 8.0.0',
  flags: {
    dynamicWidgets: '>=7.0',
    insights: '>=7.0',
  },
  templateName: 'react-instantsearch',
  appName: 'react-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'React', 'react-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
