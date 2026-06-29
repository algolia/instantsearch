const chalk = require('chalk');
const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Mobile',
  libraryName: 'react-instantsearch-core',
  supportedVersion: '>= 7.0.0 < 8.0.0',
  templateName: 'react-instantsearch-native',
  appName: 'react-instantsearch-native-app',
  keywords: [
    'algolia',
    'instantSearch',
    'react',
    'react-native',
    'react-instantsearch-native',
  ],
  tasks: {
    setup(config) {
      if (!config.silent && config.attributesForFaceting) {
        console.log();
        console.log(
          `⚠️   The ${chalk.cyan(
            'attributesForFaceting'
          )} option is not supported in this template.`
        );
        console.log();
      }

      return Promise.resolve();
    },
    install,
    teardown,
  },
};
