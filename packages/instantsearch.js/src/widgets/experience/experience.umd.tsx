import { createDocumentationMessageGenerator } from '../../lib/utils';

import { ExperienceWidget } from './types';

import type { ExperienceWidgetParams } from './types';

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
    $$supportedWidgets: {
      'ais.chat': () => {
        throw new Error(
          `"chat" is not available from the UMD build.

Please use InstantSearch.js with a packaging system:
https://www.algolia.com/doc/guides/building-search-ui/installation/js/#with-a-packaging-system`
        );
      },
    },
    render: () => {},
    dispose: () => {},
  } satisfies ExperienceWidget;
});
