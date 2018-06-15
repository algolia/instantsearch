const latestSemver = require('latest-semver');
const loadJsonFile = require('load-json-file');

const {
  getAppTemplateConfig,
  fetchLibraryVersions,
  getTemplatePath,
} = require('../utils');

module.exports = async function getConfiguration({
  options = {},
  answers = {},
  loadJsonFileFn = loadJsonFile,
} = {}) {
  const config = options.config
    ? await loadJsonFileFn(options.config) // From configuration file given as an argument
    : { ...options, ...answers }; // From the arguments and the prompt

  if (!config.template) {
    throw new Error('The template is required in the config.');
  }

  const templatePath = getTemplatePath(config.template);
  let { libraryVersion } = config;

  if (!libraryVersion) {
    const templateConfig = getAppTemplateConfig(templatePath);

    libraryVersion = await fetchLibraryVersions(
      templateConfig.libraryName
    ).then(latestSemver);
  }

  return {
    ...config,
    libraryVersion,
    template: templatePath,
  };
};
