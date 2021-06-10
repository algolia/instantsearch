const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Widget',
  libraryName: 'react-instantsearch',
  supportedVersion: '>= 6.0.0 < 7.0.0',
  templateName: 'react-instantsearch-widget',
  appName: 'react-instantsearch-app',
  keywords: [
    'algolia',
    'InstantSearch',
    'React',
    'react-instantsearch',
    'widget',
  ],
  tasks: {
    install,
    teardown,
  },
};
