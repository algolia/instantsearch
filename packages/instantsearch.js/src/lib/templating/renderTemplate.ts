import { html } from 'htm/preact';
import { warning } from 'instantsearch-core';

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

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error(
      `Template must be 'string' or 'function', was '${typeof template}' (key: ${templateKey})`
    );
  }

  const content =
    typeof template === 'function'
      ? // `Templates` also covers templates typed with `bindEvent` params,
        // whose `sendEvent` is required
        template(data, getTemplateParams({ bindEvent, sendEvent }) as any)
      : template;

  if (__DEV__ && typeof content === 'string') {
    warning(
      !/<[a-z/!]|\{\{|&(#\d+|#x[\da-f]+|[a-z]+);/i.test(content),
      `The "${templateKey}" template is a string that looks like HTML or a Hogan.js template. Strings are rendered as text, so HTML tags, entities and {{ }} placeholders show up as written.

Use a function template with the provided \`html\` function or JSX instead:

  ${templateKey}: (data, { html }) => html\`...\`

See: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates`
    );
  }

  return content;
}

function getTemplateParams({
  bindEvent,
  sendEvent,
}: {
  bindEvent?: BindEventForHits;
  sendEvent?: SendEventForHits;
}) {
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

  return params;
}
