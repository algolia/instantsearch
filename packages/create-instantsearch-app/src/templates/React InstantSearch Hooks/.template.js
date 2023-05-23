const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Web',
  libraryName: 'react-instantsearch-hooks-web',
  supportedVersion: '>= 6.0.0 < 7.0.0',
  flags: {
    dynamicWidgets: '>=6.16',
    insights: '>=6.43',
  },
  templateName: 'react-instantsearch-hooks',
  appName: 'react-instantsearch-hooks-app',
  keywords: [
    'algolia',
    'InstantSearch',
    'React',
    'Hooks',
    'react-instantsearch-hooks',
  ],
  tasks: {
    install,
    teardown,
  },
};
