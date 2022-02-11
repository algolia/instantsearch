const chalk = require('chalk');
const install = require('../../tasks/node/install');
const teardown = require('../../tasks/node/teardown');

module.exports = {
  category: 'Mobile',
  libraryName: 'react-instantsearch-hooks',
  templateName: 'react-instantsearch-hooks-native',
  appName: 'react-instantsearch-hooks-native-app',
  keywords: [
    'algolia',
    'instantSearch',
    'react',
    'react-native',
    'react-instantsearch-hooks-native',
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
