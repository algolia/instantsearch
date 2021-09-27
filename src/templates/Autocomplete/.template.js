const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Web',
  libraryName: '@algolia/autocomplete-js',
  templateName: 'autocomplete',
  appName: 'autocomplete-app',
  keywords: ['algolia', 'autocomplete'],
  tasks: {
    install,
    teardown,
  },
};
