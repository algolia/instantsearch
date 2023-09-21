const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Web',
  libraryName: 'instantsearch.js',
  supportedVersion: '>= 3.0.0 < 5.0.0',
  flags: {
    dynamicWidgets: '>= 4.30',
    insights: '>= 4.55',
    autocomplete: '>= 4.52',
  },
  templateName: 'instantsearch.js',
  appName: 'instantsearch.js-app',
  keywords: ['algolia', 'InstantSearch', 'Vanilla', 'instantsearch.js'],
  tasks: {
    install,
    teardown,
  },
};
