const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const algoliasearch = require('algoliasearch');
const chalk = require('chalk');
const semver = require('semver');
const validateProjectName = require('validate-npm-package-name');

const TEMPLATES_FOLDER = path.join(__dirname, '../templates');

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

    (validationResult.errors || []).forEach((error) => {
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

  if (!appPath) {
    throw new Error('Could not create project without directory');
  }

  return true;
}

function getAppTemplateConfig(templatePath, { loadFileFn = require } = {}) {
  try {
    return loadFileFn(path.join(templatePath, '.template.js'));
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
    .map((name) => path.join(TEMPLATES_FOLDER, name))
    .filter((source) => fs.lstatSync(source).isDirectory())
    .map((source) => path.basename(source));

  return templates;
}

function getTemplatesByCategory() {
  const templatePaths = fs
    .readdirSync(TEMPLATES_FOLDER)
    .map((name) => path.join(TEMPLATES_FOLDER, name))
    .filter((source) => fs.lstatSync(source).isDirectory());

  const templates = templatePaths.reduce((allTemplates, source) => {
    const name = path.basename(source);

    const { category } = require(`${source}/.template.js`);

    if (!category) {
      return allTemplates;
    }

    return {
      ...allTemplates,
      [category]: [...(allTemplates[category] || []), name],
    };
  }, {});

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
  const library = await index.getObject(libraryName, {
    attributesToRetrieve: ['versions'],
  });

  return Object.keys(library.versions).reverse();
}

function getLibraryVersion({ libraryName, supportedVersion = '' }) {
  return async (getVersion) => {
    const versions = await fetchLibraryVersions(libraryName);

    return getVersion(versions, supportedVersion);
  };
}

async function getLatestLibraryVersion(...args) {
  return await getLibraryVersion(...args)(semver.maxSatisfying);
}

async function getEarliestLibraryVersion(...args) {
  return await getLibraryVersion(...args)(semver.minSatisfying);
}

const splitArray = (string) =>
  string
    .split(',')
    .filter(Boolean)
    .map((x) => x.trim());

module.exports = {
  checkAppName,
  checkAppPath,
  getAppTemplateConfig,
  isYarnAvailable,
  fetchLibraryVersions,
  getLatestLibraryVersion,
  getEarliestLibraryVersion,
  getAllTemplates,
  getTemplatePath,
  getTemplatesByCategory,
  splitArray,
};
