const setup = require('../../tasks/ios/setup');
const install = require('../../tasks/ios/install');
const teardown = require('../../tasks/android/teardown');

module.exports = {
  category: 'Mobile',
  templateName: 'instantsearch-android',
  appName: 'instantsearch-android-app',
  tasks: {
    teardown,
  },
};
