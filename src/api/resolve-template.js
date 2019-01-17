const path = require('path');
const semver = require('semver');
const { getAppTemplateConfig } = require('../utils');

function getTemplateNameByLibraryVersion(templateName, libraryVersion = '') {
  if (
    templateName === 'InstantSearch.js' &&
    semver.satisfies(libraryVersion, '>= 2.0.0 < 3.0.0', {
      includePrerelease: true,
    })
  ) {
    return 'InstantSearch.js 2';
  }

  return templateName;
}

module.exports = function resolveTemplate(options, { supportedTemplates }) {
  const templateName = getTemplateNameByLibraryVersion(
    path.basename(options.template || ''),
    options.libraryVersion
  );
  let supportedVersion;

  try {
    const templateConfig = getAppTemplateConfig(
      path.resolve('src/templates', templateName)
    );
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
        options.template || ''
      )}" does not support the version ${options.libraryVersion}.`
    );
  }

  return supportedTemplates.includes(templateName)
    ? path.resolve('src/templates', templateName)
    : options.template;
};
