const { execSync } = require('child_process');

const chalk = require('chalk');

module.exports = function setup(config) {
  const logger = config.silent ? { log() {}, error() {} } : console;

  if (config.installation) {
    try {
      execSync('pod --version', { stdio: 'ignore' });
    } catch (err) {
      logger.log();
      logger.error(
        chalk.red('You must install CocoaPods to create an iOS project.')
      );
      logger.log('See: https://cocoapods.org');
      logger.log();

      process.exit(1);
    }
  }

  return Promise.resolve();
};
