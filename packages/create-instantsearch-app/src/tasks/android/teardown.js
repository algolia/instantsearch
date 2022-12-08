const chalk = require('chalk');

module.exports = function teardown(config) {
  if (!config.silent) {
    console.log();
    console.log(
      `🎉  Created ${chalk.bold.cyan(config.name)} at ${chalk.green(
        config.path
      )}.`
    );
    console.log();

    console.log('Begin by opening the new project.');
    console.log();
    console.log('⚡️  Start building something awesome!');
  }

  return Promise.resolve();
};
