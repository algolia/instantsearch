import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import uniq from 'lodash/uniq';

function prepareTemplates(defaultTemplates = {}, templates = {}) {
  const allKeys = uniq([...keys(defaultTemplates), ...keys(templates)]);

  return reduce(
    allKeys,
    (config, key) => {
      const defaultTemplate = defaultTemplates[key];
      const customTemplate = templates[key];
      const isCustomTemplate =
        customTemplate !== undefined && customTemplate !== defaultTemplate;

      config.templates[key] = isCustomTemplate
        ? customTemplate
        : defaultTemplate;
      config.useCustomCompileOptions[key] = isCustomTemplate;

      return config;
    },
    { templates: {}, useCustomCompileOptions: {} }
  );
}

/**
 * Prepares an object to be passed to the Template widget
 * @param {object} unknownBecauseES6 an object with the following attributes:
 *  - defaultTemplate
 *  - templates
 *  - templatesConfig
 * @return {object} the configuration with the attributes:
 *  - defaultTemplate
 *  - templates
 *  - useCustomCompileOptions
 */
function prepareTemplateProps({
  defaultTemplates,
  templates,
  templatesConfig,
}) {
  const preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return {
    templatesConfig,
    ...preparedTemplates,
  };
}

export default prepareTemplateProps;
