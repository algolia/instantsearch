const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

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
