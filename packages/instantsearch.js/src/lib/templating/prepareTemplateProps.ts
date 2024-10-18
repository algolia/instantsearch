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
  const filteredTemplates = Object.fromEntries(
    Object.entries(templates || {}).filter(([, value]) => Boolean(value))
  );

  return { templates: { ...defaultTemplates, ...filteredTemplates } };
}
