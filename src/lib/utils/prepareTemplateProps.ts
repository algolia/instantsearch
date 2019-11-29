import uniq from './uniq';
import { Template } from '../../types';

type TemplatesConfig = object;

type Templates = {
  [key: string]: Template;
};

type TemplateProps = {
  defaultTemplates: Templates;
  templates: Templates;
  templatesConfig: TemplatesConfig;
};

type PreparedTemplateProps = {
  templatesConfig: TemplatesConfig;
  templates: Templates;
  useCustomCompileOptions: { [key: string]: boolean };
};

function prepareTemplates(
  defaultTemplates: Templates = {},
  templates: Templates = {}
) {
  const allKeys = uniq([
    ...Object.keys(defaultTemplates),
    ...Object.keys(templates),
  ]);

  return allKeys.reduce(
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
    {
      templates: {} as Templates,
      useCustomCompileOptions: {} as { [key: string]: boolean },
    }
  );
}

/**
 * Prepares an object to be passed to the Template widget
 */
function prepareTemplateProps({
  defaultTemplates,
  templates,
  templatesConfig,
}: TemplateProps): PreparedTemplateProps {
  const preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return {
    templatesConfig,
    ...preparedTemplates,
  };
}

export default prepareTemplateProps;
