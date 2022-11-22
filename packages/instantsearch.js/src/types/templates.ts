import type { VNode } from 'preact';
import type {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../helpers/components';
import type { html } from 'htm/preact';
import type { BindEventForHits, SendEventForHits } from '../lib/utils';

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData, params: TemplateParams) => VNode | VNode[] | string);

export type TemplateParams = BindEventForHits & {
  html: typeof html;
  components: {
    Highlight: typeof Highlight;
    ReverseHighlight: typeof ReverseHighlight;
    Snippet: typeof Snippet;
    ReverseSnippet: typeof ReverseSnippet;
  };
  sendEvent?: SendEventForHits;
};

export type TemplateWithBindEvent<TTemplateData = void> =
  | string
  | ((data: TTemplateData, params: TemplateParams) => VNode | VNode[] | string);

export type Templates = {
  [key: string]: Template<any> | TemplateWithBindEvent<any> | undefined;
};

export type HoganHelpers<TKeys extends string = string> = Record<
  TKeys,
  (text: string, render: (value: string) => string) => string
>;
