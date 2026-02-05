import type { Templates, TemplatesConfig } from '../../types';

export type PreparedTemplateProps<TTemplates extends Templates> = {
  templates: TTemplates;
  templatesConfig?: TemplatesConfig;
};

/**
 * Prepares an object to be passed to the Template widget
 */
export function prepareTemplateProps<TTemplates extends Templates>({
  defaultTemplates,
  templates,
  templatesConfig,
}: {
  defaultTemplates: TTemplates;
  templates?: Partial<TTemplates>;
  templatesConfig?: TemplatesConfig;
}): PreparedTemplateProps<TTemplates> {
  const filteredTemplates: Templates = {};
  for (const [key, value] of Object.entries(templates || {})) {
    if (value) {
      filteredTemplates[key] = value;
    }
  }

  return {
    templates: { ...defaultTemplates, ...filteredTemplates },
    templatesConfig,
  };
}
