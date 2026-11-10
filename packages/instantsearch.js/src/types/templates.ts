import type {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../helpers/components';
import type { html } from 'htm/preact';
import type { SendEventForHits } from 'instantsearch-core';
import type { VNode } from 'preact';

/**
 * A string is rendered as text. A function receives the template data and
 * `{ html, components, sendEvent }`, and returns a VNode, a string (rendered
 * as text) or `null`.
 */
export type Template<TTemplateData = void> =
  | string
  | ((
      data: TTemplateData,
      params: TemplateParams
    ) => VNode | VNode[] | string | null);

export type TemplateParams = {
  html: typeof html;
  components: {
    Highlight: typeof Highlight;
    ReverseHighlight: typeof ReverseHighlight;
    Snippet: typeof Snippet;
    ReverseSnippet: typeof ReverseSnippet;
  };
  sendEvent?: SendEventForHits;
};

interface TemplateWithSendEventParams extends TemplateParams {
  sendEvent: SendEventForHits;
}

export type TemplateWithSendEvent<TTemplateData = void> =
  | string
  | ((
      data: TTemplateData,
      params: TemplateWithSendEventParams
    ) => VNode | VNode[] | string);

export type Templates = {
  [key: string]:
    | Template<any>
    | TemplateWithSendEvent<any>
    | Templates
    | undefined;
};
