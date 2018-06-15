const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  libraryName: 'react-instantsearch',
  templateName: 'react-instantsearch',
  appName: 'react-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'React', 'react-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
