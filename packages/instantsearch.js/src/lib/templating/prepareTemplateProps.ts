import type { Templates } from '../../types';

export type PreparedTemplateProps<TTemplates extends Templates> = {
  templates: TTemplates;
};

/**
 * Prepares an object to be passed to the Template widget
 */
export function prepareTemplateProps<TTemplates extends Templates>({
  defaultTemplates,
  templates,
}: {
  defaultTemplates: TTemplates;
  templates?: Partial<TTemplates>;
}): PreparedTemplateProps<TTemplates> {
  const filteredTemplates: Templates = {};
  for (const [key, value] of Object.entries(templates || {})) {
    if (value) {
      filteredTemplates[key] = value;
    }
  }

  return { templates: { ...defaultTemplates, ...filteredTemplates } };
}
