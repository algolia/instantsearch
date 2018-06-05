const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const validateProjectName = require('validate-npm-package-name');
const algoliasearch = require('algoliasearch');

const TEMPLATES_FOLDER = path.join(__dirname, '../../templates');

const algoliaConfig = {
  appId: 'OFCNCOG2CU',
  apiKey: 'f54e21fa3a2a0160595bb058179bfb1e',
  indexName: 'npm-search',
};

const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
const index = client.initIndex(algoliaConfig.indexName);

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);

  if (!validationResult.validForNewPackages) {
    let errorMessage = `Could not create a project called "${chalk.red(
      appName
    )}" because of npm naming restrictions.`;

    (validationResult.errors || []).forEach(error => {
      errorMessage += `\n  - ${error}`;
    });

    throw new Error(errorMessage);
  }

  return true;
}

function checkAppPath(appPath) {
  if (fs.existsSync(appPath)) {
    if (fs.lstatSync(appPath).isDirectory()) {
      const files = fs.readdirSync(appPath);

      if (files && files.length > 0) {
        throw new Error(
          `Could not create project in destination folder "${chalk.red(
            appPath
          )}" because it is not empty.`
        );
      }
    } else {
      throw new Error(
        `Could not create project at path ${chalk.red(
          appPath
        )} because a file of the same name already exists.`
      );
    }
  }

  return true;
}

function getAppTemplateConfig(templatePath, { loadFileFn = require } = {}) {
  try {
    const templateConfig = loadFileFn(`${templatePath}/.template.js`);

    if (!templateConfig.libraryName) {
      throw new Error(
        'The key `libraryName` is must be the name of the library to use on npm.'
      );
    }

    return templateConfig;
  } catch (err) {
    throw new Error(
      `The template configuration file \`.template.js\` contains errors:
${err.message}`
    );
  }
}

function isYarnAvailable() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

function getAllTemplates() {
  const templates = fs
    .readdirSync(TEMPLATES_FOLDER)
    .map(name => path.join(TEMPLATES_FOLDER, name))
    .filter(source => fs.lstatSync(source).isDirectory())
    .map(source => path.basename(source));

  return templates;
}

function getTemplatePath(templateName) {
  const supportedTemplates = getAllTemplates();

  // We support the template, let's retrieve its path
  if (supportedTemplates.includes(templateName)) {
    return path.join(TEMPLATES_FOLDER, templateName);
  }

  // This is a custom template, it's a path already
  return templateName;
}

async function fetchLibraryVersions(libraryName) {
  const library = await index.getObject(libraryName);

  return Object.keys(library.versions).reverse();
}

module.exports = {
  checkAppName,
  checkAppPath,
  getAppTemplateConfig,
  isYarnAvailable,
  fetchLibraryVersions,
  getAllTemplates,
  getTemplatePath,
};
