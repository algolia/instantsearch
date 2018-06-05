const install = require('../../packages/tasks/node/install');
const teardown = require('../../packages/tasks/node/teardown');

module.exports = {
  libraryName: 'angular-instantsearch',
  templateName: 'angular-instantsearch',
  appName: 'angular-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'Angular', 'angular-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
