const path = require('path');

const semver = require('semver');

const { getAppTemplateConfig } = require('../utils');

function getTemplateNameByLibraryVersion({
  template = '',
  libraryVersion = '',
}) {
  const templateName = path.basename(template);

  if (
    templateName === 'InstantSearch.js' &&
    semver.satisfies(libraryVersion, '>= 2.0.0 < 3.0.0', {
      includePrerelease: true,
    })
  ) {
    return 'InstantSearch.js 2';
  }

  if (
    templateName === 'Vue InstantSearch' &&
    semver.satisfies(libraryVersion, '>= 1.0.0 < 2.0.0', {
      includePrerelease: true,
    })
  ) {
    return 'Vue InstantSearch 1';
  }

  return template;
}

module.exports = function resolveTemplate(options, { supportedTemplates }) {
  const templateName = getTemplateNameByLibraryVersion(options);
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
