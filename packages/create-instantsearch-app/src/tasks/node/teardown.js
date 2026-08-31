const { execSync } = require('child_process');
const path = require('path');

const chalk = require('chalk');

const { isYarnAvailable } = require('../../utils');

// `node_modules/.bin/prettier` can point at an unrelated transitive copy of Prettier (a much
// older major, with different defaults), so we resolve the version this package depends on
// rather than trusting whichever binary happens to be on the PATH.
function prettierCommand(hasYarn) {
  try {
    const manifestPath = require.resolve('prettier/package.json');
    const { bin } = require(manifestPath);
    const binPath = path.join(
      path.dirname(manifestPath),
      typeof bin === 'string' ? bin : bin.prettier
    );

    return `node "${binPath}"`;
  } catch {
    // Prettier isn't installed next to this package — for instance when the CLI runs through
    // `npx` and only its `dependencies` were installed.
    return `${hasYarn ? 'yarn' : 'npx'} prettier`;
  }
}

module.exports = function teardown(config) {
  const hasYarn = isYarnAvailable();
  const currentDirectory = process.cwd();
  const cdPath =
    path.join(currentDirectory, config.name) === config.path
      ? config.name
      : config.path;

  try {
    // This runs the Prettier dependency from Create InstantSearch App (not the template itself)
    // with the template's Prettier configuration.
    // We use the "global" Prettier dependency because it is installed for sure at this step,
    // while the template's Prettier dependency might not be installed if `config.installation`
    // is `false`.
    execSync(
      `${prettierCommand(hasYarn)} "${cdPath}/src/**/*.{json,html,css,js,vue,ts,tsx}" --write --config "${cdPath}/.prettierrc"`,
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
