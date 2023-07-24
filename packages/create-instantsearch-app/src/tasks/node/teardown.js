const { execSync } = require('child_process');
const path = require('path');

const chalk = require('chalk');

const { isYarnAvailable } = require('../../utils');

module.exports = function teardown(config) {
  const hasYarn = isYarnAvailable();
  const currentDirectory = process.cwd();
  const cdPath =
    path.join(currentDirectory, config.name) === config.path
      ? config.name
      : config.path;

  try {
    const command = hasYarn ? 'yarn' : 'npx';

    // This runs the Prettier dependency from Create InstantSearch App (not the template itself)
    // with the template's Prettier configuration.
    // We use the "global" Prettier dependency because it is installed for sure at this step,
    // while the template's Prettier dependency might not be installed if `config.installation`
    // is `false`.
    execSync(
      `${command} prettier "${cdPath}/src/**/*.{json,html,css,js,vue,ts,tsx}" --write --config "${cdPath}/.prettierrc"`,
      {
        stdio: 'ignore',
      }
    );
  } catch (error) {
    // We swallow Prettier's errors because we're not totally in control of what might happen.
    // Besides, prettifying the files in not necessary in the app generation lifecycle.
    // Prettier might throw for these known reasons:
    //  - there's no `.prettierrc` file in the template
    //  - the destination folder doesn't have the rights
  }

  if (!config.silent) {
    try {
      const command = hasYarn ? 'yarn' : 'npm';
      const installCommand = `${command} install`;
      const startCommand = `${command} start`;

      console.log();
      console.log(
        `🎉  Created ${chalk.bold.cyan(config.name)} at ${chalk.green(cdPath)}.`
      );
      console.log();

      console.log('Begin by typing:');
      console.log();
      console.log(`  ${chalk.cyan('cd')} ${cdPath}`);

      if (config.installation === false) {
        console.log(`  ${chalk.cyan(`${installCommand}`)}`);
      }

      console.log(`  ${chalk.cyan(`${startCommand}`)}`);
      console.log();
      console.log('⚡️  Start building something awesome!');
    } catch (err) {
      console.log();
      console.error(chalk.red('🛑  The app generation failed.'));
      console.error(err);
      console.log();

      return Promise.reject(err);
    }
  }

  return Promise.resolve();
};
