const path = require('path');

function getTemplateNameByLibraryVersion(templateName, libraryVersion = '') {
  if (
    templateName === 'InstantSearch.js' &&
    libraryVersion.substr(0, 2) === '2.'
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

  return supportedTemplates.includes(templateName)
    ? path.resolve('src/templates', templateName)
    : options.template;
};
