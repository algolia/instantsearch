const { execSync } = require('child_process');
const process = require('process');

const chalk = require('chalk');

const { isYarnAvailable } = require('../../utils');

module.exports = function install(config) {
  const logger = config.silent ? { log() {}, error() {} } : console;
  const installCommand = isYarnAvailable() ? 'yarn' : 'npm install';
  const initialDirectory = process.cwd();

  logger.log();
  logger.log('📦  Installing dependencies...');
  logger.log();

  process.chdir(config.path);

  try {
    execSync(`${installCommand}`, {
      stdio: config.silent ? 'ignore' : 'inherit',
    });
  } catch (err) {
    logger.log();
    logger.log();

    if (err.signal !== 'SIGINT') {
      logger.error(chalk.red('📦  Dependencies could not be installed.'));

      logger.log(err);
      logger.log();
      logger.log('Try to create the app without installing the dependencies:');
      logger.log(
        `  ${chalk.cyan('create-instantsearch-app')} ${process.argv
          .slice(2)
          .join(' ')} --no-installation`
      );
      logger.log();
    }

    logger.log();
    logger.error(chalk.red('🛑  Aborting the app generation.'));
    logger.log();

    return Promise.reject(err);
  }

  process.chdir(initialDirectory);

  return Promise.resolve();
};
