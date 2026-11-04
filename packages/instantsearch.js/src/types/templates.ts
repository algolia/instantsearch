import type {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../helpers/components';
import type { html } from 'htm/preact';
import type { SendEventForHits } from 'instantsearch-core';
import type { VNode } from 'preact';

export type Template<TTemplateData = void> = (
  data: TTemplateData,
  params: TemplateParams
) => VNode | VNode[] | string | null;

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

type TemplateWithSendEventParams = TemplateParams & {
  sendEvent: SendEventForHits;
};

export type TemplateWithSendEvent<TTemplateData = void> = (
  data: TTemplateData,
  params: TemplateWithSendEventParams
) => VNode | VNode[] | string | null;

/**
 * The `templates` option of a widget. Besides templates, it can hold nested
 * template groups and plain-text options (labels, placeholders, …) that
 * widgets read directly. Only functions can be rendered as templates.
 */
export type Templates = {
  [key: string]:
    | Template<any>
    | TemplateWithSendEvent<any>
    | Templates
    | string
    | undefined;
};
