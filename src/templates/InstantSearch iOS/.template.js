const setup = require('../../tasks/ios/setup');
const install = require('../../tasks/ios/install');
const teardown = require('../../tasks/ios/teardown');

module.exports = {
  templateName: 'instantsearch-ios',
  appName: 'instantsearch-ios-app',
  tasks: {
    setup,
    install,
    teardown,
  },
};
