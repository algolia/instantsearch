import { html } from 'htm/preact';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../helpers/components';

import type { Templates, TemplateParams } from '../../types';
import type { SendEventForHits } from '../utils/createSendEventForHits';

/**
 * Renders a function template. Kept apart from `renderTemplate` so that widgets
 * which don't support string templates don't bundle Hogan.js.
 */
export function renderFunctionTemplate({
  template,
  data,
  sendEvent,
}: {
  template: Extract<Templates[string], (...args: any[]) => any>;
  data?: Record<string, any>;
  sendEvent?: SendEventForHits;
}) {
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

  // `Templates` also covers legacy templates typed with `bindEvent` params
  return template(data, params as any);
}
