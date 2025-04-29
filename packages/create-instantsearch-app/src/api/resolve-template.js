const path = require('path');

const semver = require('semver');

const { getAppTemplateConfig } = require('../utils');

module.exports = function resolveTemplate(options, { supportedTemplates }) {
  const templateName = options.template || '';
  const templatePath = path.resolve('src/templates', templateName || '');
  let supportedVersion;

  try {
    const templateConfig = getAppTemplateConfig(templatePath);
    supportedVersion = templateConfig.supportedVersion;
  } catch (error) {
    // The template doesn't provide a configuration file `.template.js`.
  }

  if (
    supportedVersion &&
    options.libraryVersion &&
    !semver.satisfies(options.libraryVersion, supportedVersion, {
      includePrerelease: true,
    })
  ) {
    throw new Error(
      `The template "${path.basename(
        templateName || ''
      )}" does not support the version ${options.libraryVersion}.`
    );
  }

  return supportedTemplates.includes(templateName)
    ? templatePath
    : options.template;
};
