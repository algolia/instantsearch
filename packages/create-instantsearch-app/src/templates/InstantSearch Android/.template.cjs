const setup = require('../../tasks/ios/setup.cjs');
const install = require('../../tasks/ios/install.cjs');
const teardown = require('../../tasks/android/teardown.cjs');

module.exports = {
  category: 'Mobile',
  templateName: 'instantsearch-android',
  appName: 'instantsearch-android-app',
  tasks: {
    teardown,
  },
};
