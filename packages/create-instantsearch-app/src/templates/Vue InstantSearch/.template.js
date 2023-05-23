const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Web',
  libraryName: 'vue-instantsearch',
  supportedVersion: '>= 3.0.0 < 5.0.0',
  flags: {
    dynamicWidgets: '>= 4.2.0',
    insights: '>= 4.9.0',
  },
  templateName: 'vue-instantsearch',
  appName: 'vue-instantsearch-app',
  keywords: ['algolia', 'InstantSearch', 'Vue', 'vue-instantsearch'],
  tasks: {
    install,
    teardown,
  },
};
