import { html } from 'htm/preact';
import { warning } from 'instantsearch-core/internal';

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

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error(
      `Template must be 'string' or 'function', was '${typeof template}' (key: ${templateKey})`
    );
  }

  const content =
    typeof template === 'function'
      ? // `Templates` also covers templates whose `sendEvent` param is
        // required; the widgets using them always provide it
        template(data, getTemplateParams(sendEvent) as any)
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

function getTemplateParams(sendEvent?: SendEventForHits): TemplateParams {
  return {
    html,
    sendEvent,
    components: {
      Highlight,
      ReverseHighlight,
      Snippet,
      ReverseSnippet,
    },
  };
}
