#!/usr/bin/env node

/*
 * This script releases compiled templates to the branch `templates`.
 * This branch is used for CodeSandbox.
 * Example: https://codesandbox.io/s/github/algolia/instantsearch/tree/templates/instantsearch.js
 *
 * If this is the first time running this script, you need to create a new orphan branch:
 *   $ git checkout --orphan templates
 * To be able to push the branch, create a first dummy commit.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { getLatestLibraryVersion } = require('../src/utils');
const createInstantSearchApp = require('../');

const GITHUB_REPOSITORY = 'https://github.com/algolia/instantsearch.git';
const TEMPLATES_BRANCH = 'templates';
const BUILD_FOLDER = 'build';

function cleanup() {
  if (fs.existsSync(BUILD_FOLDER)) {
    execSync(`rm -rf ${BUILD_FOLDER}`);
  }
}

async function build() {
  cleanup();

  // Clone the `templates` branch inside the `build` folder on the current branch
  execSync(`mkdir ${BUILD_FOLDER}`);
  execSync(
    `git clone -b ${TEMPLATES_BRANCH} --single-branch ${GITHUB_REPOSITORY} ${BUILD_FOLDER}`,
    { stdio: 'ignore' }
  );

  const templatesFolder = path.join(__dirname, '../src/templates');
  const templates = fs
    .readdirSync(templatesFolder)
    .map((name) => path.join(templatesFolder, name))
    .filter((source) => fs.lstatSync(source).isDirectory())
    .map((source) => path.basename(source));

  console.log('▶︎  Generating templates');

  // Generate all demos
  await Promise.all(
    templates.map(async (templateTitle) => {
      const {
        appName,
        templateName,
        libraryName,
        keywords,
        supportedVersion,
      } = require(`${templatesFolder}/${templateTitle}/.template.js`);
      const appPath = `${BUILD_FOLDER}/${templateName}`;

      // Remove the old app
      execSync(`rm -rf ${appPath}`);

      const appConfig = {
        name: appName,
        template: templateTitle,
        libraryVersion:
          libraryName &&
          (await getLatestLibraryVersion({ libraryName, supportedVersion })),
        appId: 'latency',
        apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
        indexName:
          libraryName === 'autocomplete.js'
            ? 'instant_search_demo_query_suggestions'
            : 'instant_search',
        attributesToDisplay:
          libraryName === 'autocomplete.js'
            ? ['query']
            : ['name', 'description'],
        attributesForFaceting: ['brand'],
        installation: false,
        silent: true,
      };
      const app = createInstantSearchApp(appPath, appConfig);

      await app.create();

      try {
        const packagePath = `${appPath}/package.json`;
        const packageConfig = JSON.parse(fs.readFileSync(packagePath));
        const packageConfigFilled = {
          ...packageConfig,
          keywords,
        };

        fs.writeFileSync(
          packagePath,
          JSON.stringify(packageConfigFilled, null, 2)
        );
      } catch (error) {
        // There's no `package.json` file (it's not a web template).
      }
    })
  );

  if (!process.env.GITHUB_ACTION) {
    // Change directory to the build folder to execute Git commands
    process.chdir(BUILD_FOLDER);

    const uncommitedChanges = execSync('git status --porcelain')
      .toString()
      .trim();

    if (uncommitedChanges) {
      // Stage all new demos to Git
      execSync('git add -A');

      // Commit the new demos
      const commitMessage = 'feat(template): Update templates';

      console.log('▶︎  Commiting');
      console.log();
      console.log(`  ${chalk.cyan(commitMessage)}`);

      execSync(`git commit -m "${commitMessage}"`);

      // Push the new demos to the `templates` branch
      console.log();
      console.log(`▶︎  Pushing to branch "${chalk.green(TEMPLATES_BRANCH)}"`);
      execSync(`git push origin ${TEMPLATES_BRANCH}`);

      console.log();
      console.log(
        `✅  Templates have been compiled to the branch "${chalk.green(
          TEMPLATES_BRANCH
        )}".`
      );
    } else {
      console.log();
      console.log('ℹ️  No changes made to the templates.');
    }

    console.log();
    process.chdir('..');

    cleanup();
  }
}

build().catch((err) => {
  console.log();
  console.log('❎  Canceled template compilation.');

  if (err) {
    console.error(err);
  }

  cleanup();

  process.exit(1);
});
