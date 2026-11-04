import { html } from 'htm/preact';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../helpers/components';

import type { Templates, TemplateParams } from '../../types';
import type { BindEventForHits, SendEventForHits } from 'instantsearch-core';

export function renderTemplate({
  templates,
  templateKey,
  data,
  bindEvent,
  sendEvent,
}: {
  templates: Templates;
  templateKey: string;
  data?: Record<string, any>;
  bindEvent?: BindEventForHits;
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

  // @MAJOR no longer pass bindEvent once it is removed from the render state
  const params = (bindEvent || {}) as TemplateParams;

  params.html = html;
  params.sendEvent = sendEvent;
  params.components = {
    Highlight,
    ReverseHighlight,
    Snippet,
    ReverseSnippet,
  };

  // `Templates` also covers templates typed with `bindEvent` params, whose
  // `sendEvent` is required
  return template(data, params as any);
}
