const latestSemver = require('latest-semver');
const loadJsonFile = require('load-json-file');
const camelCase = require('lodash.camelcase');

const { fetchLibraryVersions } = require('../utils');

function capitalize(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function createNameAlternatives({ organization, name }) {
  return {
    packageName: `@${organization}/${name}`,
    widgetType: `${organization}.${name}`,
    camelCaseName: camelCase(name),
    pascalCaseName: capitalize(camelCase(name)),
  };
}

async function getLibraryVersion(config, templateConfig) {
  const { libraryName } = templateConfig;
  const { libraryVersion } = config;

  if (libraryName && !libraryVersion) {
    const versions = await fetchLibraryVersions(libraryName);

    // Return the latest available version when
    // the stable version is not available
    return latestSemver(versions) || versions[0];
  }

  return libraryVersion;
}

async function getConfiguration({ options = {}, answers = {} } = {}) {
  const config = options.config
    ? await loadJsonFile(options.config) // From configuration file given as an argument
    : { ...options, ...answers }; // From the arguments and the prompt

  if (!config.template) {
    throw new Error('The template is required in the config.');
  }

  return config;
}

module.exports = {
  getConfiguration,
  getLibraryVersion,
  createNameAlternatives,
};
