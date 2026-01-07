import { createDocumentationMessageGenerator } from '../../lib/utils';

type ExperienceWidgetParams = {
  id: string;
};

const withUsage = createDocumentationMessageGenerator({ name: 'experience' });

export default (function experience(widgetParams: ExperienceWidgetParams) {
  const { id } = widgetParams || {};

  if (!id) {
    throw new Error(withUsage('The `id` option is required.'));
  }

  return {
    $$type: 'ais.experience',
    $$widgetType: 'ais.experience',
    $$widgetParams: widgetParams,
    render: () => {},
    dispose: () => {},
  };
});
