import { html } from 'htm/preact';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../helpers/components';
import { warning } from '../utils';

import type { Templates } from '../../types';
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

  if (typeof template === 'string') {
    warning(
      template.indexOf('<') === -1,
      `Template '${templateKey}' is a string, it will be rendered as text, not as html`
    );
    return template;
  }

  if (typeof template !== 'function') {
    throw new Error(
      `Template must be 'function', was '${typeof template}' (key: ${templateKey})`
    );
  }

  return template(data, {
    html,
    components: { Highlight, ReverseHighlight, Snippet, ReverseSnippet },
    sendEvent: sendEvent!,
  });
}
