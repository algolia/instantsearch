const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Web',
  libraryName: 'vue-instantsearch',
  templateName: 'vue-instantsearch',
  supportedVersion: '>= 3.0.0 < 5.0.0',
  appName: 'vue-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'Vue', 'vue-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
