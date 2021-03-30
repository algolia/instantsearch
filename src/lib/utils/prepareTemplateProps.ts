import uniq from './uniq';
import { Templates } from '../../types';

type TemplatesConfig = {
  helpers?: Record<
    string,
    (text: string, render: (value: any) => string) => string
  >;
  // https://github.com/twitter/hogan.js/#compilation-options
  compileOptions?: {
    asString?: boolean;
    sectionTags?: Array<{
      o?: string;
      c?: string;
    }>;
    delimiters?: string;
    disableLambda?: boolean;
  };
};

export type PreparedTemplateProps<TTemplates extends Templates> = {
  templatesConfig: TemplatesConfig;
  templates: TTemplates;
  useCustomCompileOptions: {
    [TKey in keyof Partial<TTemplates>]: boolean;
  };
};

function prepareTemplates<TTemplates extends Templates>(
  // can not use = {} here, since the template could have different constraints
  defaultTemplates?: TTemplates,
  templates: Partial<TTemplates> = {}
) {
  const allKeys = uniq([
    ...Object.keys(defaultTemplates || {}),
    ...Object.keys(templates),
  ]);

  return allKeys.reduce(
    (config, key: keyof TTemplates) => {
      const defaultTemplate = defaultTemplates
        ? defaultTemplates[key]
        : undefined;
      const customTemplate = templates[key];
      const isCustomTemplate =
        customTemplate !== undefined && customTemplate !== defaultTemplate;

      config.templates[key] = isCustomTemplate
        ? customTemplate! // typescript doesn't recognize that this condition asserts customTemplate is defined
        : defaultTemplate!;

      config.useCustomCompileOptions[key] = isCustomTemplate;

      return config;
    },
    {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      templates: {} as TTemplates,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      useCustomCompileOptions: {} as {
        [TKey in keyof TTemplates]: boolean;
      },
    }
  );
}

/**
 * Prepares an object to be passed to the Template widget
 */
function prepareTemplateProps<TTemplates extends Templates>({
  defaultTemplates,
  templates,
  templatesConfig,
}: {
  defaultTemplates: TTemplates;
  templates?: Partial<TTemplates>;
  templatesConfig: TemplatesConfig;
}): PreparedTemplateProps<TTemplates> {
  const preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return {
    templatesConfig,
    ...preparedTemplates,
  };
}

export default prepareTemplateProps;
