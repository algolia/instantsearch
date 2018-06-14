const install = require('../../packages/tasks/node/install');
const teardown = require('../../packages/tasks/node/teardown');

module.exports = {
  libraryName: 'react-instantsearch-native',
  templateName: 'react-instantsearch-native',
  appName: 'react-instantsearch-native-app',
  keywords: ['algolia', 'instantSearch', 'react', 'react-native', 'react-instantsearch-native'],
  tasks: {
    install,
    teardown,
  },
};
