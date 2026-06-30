const teardown = require('../../tasks/android/teardown');
const install = require('../../tasks/ios/install');
const setup = require('../../tasks/ios/setup');

module.exports = {
  category: 'Mobile',
  templateName: 'instantsearch-android',
  appName: 'instantsearch-android-app',
  tasks: {
    teardown,
  },
};
