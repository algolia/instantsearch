import { html } from 'htm/preact';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../helpers/components';

import type { Templates, TemplateParams } from '../../types';
import type { SendEventForHits } from 'instantsearch-core';

export function renderTemplate({
  templates,
  templateKey,
  data,
  sendEvent,
}: {
  templates: Templates;
  templateKey: string;
  data?: Record<string, any>;
  sendEvent?: SendEventForHits;
}) {
  const template = templates[templateKey];

  if (typeof template !== 'function') {
    throw new Error(
      `Template must be a function, was '${typeof template}' (key: ${templateKey}).${
        typeof template === 'string'
          ? `

String-based (Hogan.js) templates are no longer supported. Use a function template with the \`html\` tagged template or JSX instead:

  ${templateKey}: (data, { html }) => html\`...\`

See: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates`
          : ''
      }`
    );
  }

  const params: TemplateParams = {
    html,
    sendEvent,
    components: {
      Highlight,
      ReverseHighlight,
      Snippet,
      ReverseSnippet,
    },
  };

  // `Templates` also covers templates whose `sendEvent` param is required;
  // the widgets that use them always provide it.
  return template(data, params as any);
}
