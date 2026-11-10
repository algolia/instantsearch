import type { Templates } from '../../types';

export type PreparedTemplateProps<TTemplates extends Templates> = {
  templates: TTemplates;
};

/**
 * Prepares an object to be passed to the Template widget.
 *
 * Custom templates override the defaults; `undefined` custom templates fall
 * back to the default.
 */
export function prepareTemplateProps<TTemplates extends Templates>({
  defaultTemplates,
  templates = {},
}: {
  defaultTemplates: TTemplates;
  templates?: Partial<TTemplates>;
}): PreparedTemplateProps<TTemplates> {
  const preparedTemplates = { ...defaultTemplates };

  Object.keys(templates).forEach((key: keyof TTemplates) => {
    const customTemplate = templates[key];

    if (customTemplate !== undefined) {
      preparedTemplates[key] = customTemplate;
    }
  });

  return { templates: preparedTemplates };
}
