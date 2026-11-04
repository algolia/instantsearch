import type {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../helpers/components';
import type { html } from 'htm/preact';
import type {
  BuiltInBindEventForHits,
  CustomBindEventForHits,
  SendEventForHits,
} from 'instantsearch-core';
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

interface TemplateWithBindEventParams extends TemplateParams {
  /** @deprecated use sendEvent instead */
  (
    ...args: Parameters<BuiltInBindEventForHits>
  ): ReturnType<BuiltInBindEventForHits>;
  /** @deprecated use sendEvent instead */
  (
    ...args: Parameters<CustomBindEventForHits>
  ): ReturnType<CustomBindEventForHits>;
  sendEvent: SendEventForHits;
}

export type TemplateWithBindEvent<TTemplateData = void> =
  | string
  | ((
      data: TTemplateData,
      params: TemplateWithBindEventParams
    ) => VNode | VNode[] | string);

export type Templates = {
  [key: string]:
    | Template<any>
    | TemplateWithBindEvent<any>
    | Templates
    | undefined;
};
