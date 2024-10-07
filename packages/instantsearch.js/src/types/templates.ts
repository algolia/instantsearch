import type {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../helpers/components';
import type { SendEventForHits } from '../lib/utils';
import type { html } from 'htm/preact';
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

interface TemplateWithSendEventParams extends TemplateParams {
  sendEvent: SendEventForHits;
}

export type TemplateWithSendEvent<TTemplateData = void> = (
  data: TTemplateData,
  params: TemplateWithSendEventParams
) => VNode | VNode[] | string;

export type Templates = {
  [key: string]:
    | Template<any>
    | TemplateWithSendEvent<any>
    | string
    | undefined;
};
