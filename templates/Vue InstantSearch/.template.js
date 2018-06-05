const install = require('../../packages/tasks/node/install');
const teardown = require('../../packages/tasks/node/teardown');

module.exports = {
  libraryName: 'vue-instantsearch',
  templateName: 'vue-instantsearch',
  appName: 'vue-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'Vue', 'vue-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
