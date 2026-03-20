const setup = require('../../tasks/ios/setup.cjs');
const install = require('../../tasks/ios/install.cjs');
const teardown = require('../../tasks/ios/teardown.cjs');

module.exports = {
  category: 'Mobile',
  templateName: 'instantsearch-ios',
  appName: 'instantsearch-ios-app',
  tasks: {
    setup,
    install,
    teardown,
  },
};
