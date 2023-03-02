import {
  highlight,
  reverseHighlight,
  snippet,
  reverseSnippet,
  insights,
} from '../helpers';

import { formatNumber } from './formatNumber';

import type {
  HighlightOptions,
  ReverseHighlightOptions,
  SnippetOptions,
  ReverseSnippetOptions,
} from '../helpers';
import type {
  Hit,
  HoganHelpers,
  InsightsClientMethod,
  InsightsClientPayload,
} from '../types';

type DefaultHoganHelpers = HoganHelpers<
  | 'formatNumber'
  | 'highlight'
  | 'reverseHighlight'
  | 'snippet'
  | 'reverseSnippet'
  | 'insights'
>;

export default function hoganHelpers({
  numberLocale,
}: {
  numberLocale?: string;
}): DefaultHoganHelpers {
  return {
    formatNumber(value, render) {
      return formatNumber(Number(render(value)), numberLocale);
    },
    highlight(options, render) {
      try {
        const highlightOptions: Omit<HighlightOptions, 'hit'> =
          JSON.parse(options);

        return render(
          highlight({
            ...highlightOptions,
            hit: this,
          })
        );
      } catch (error) {
        throw new Error(`
The highlight helper expects a JSON object of the format:
{ "attribute": "name", "highlightedTagName": "mark" }`);
      }
    },
    reverseHighlight(options, render) {
      try {
        const reverseHighlightOptions: Omit<ReverseHighlightOptions, 'hit'> =
          JSON.parse(options);

        return render(
          reverseHighlight({
            ...reverseHighlightOptions,
            hit: this,
          })
        );
      } catch (error) {
        throw new Error(`
  The reverseHighlight helper expects a JSON object of the format:
  { "attribute": "name", "highlightedTagName": "mark" }`);
      }
    },
    snippet(options, render) {
      try {
        const snippetOptions: Omit<SnippetOptions, 'hit'> = JSON.parse(options);

        return render(
          snippet({
            ...snippetOptions,
            hit: this,
          })
        );
      } catch (error) {
        throw new Error(`
The snippet helper expects a JSON object of the format:
{ "attribute": "name", "highlightedTagName": "mark" }`);
      }
    },
    reverseSnippet(options, render) {
      try {
        const reverseSnippetOptions: Omit<ReverseSnippetOptions, 'hit'> =
          JSON.parse(options);

        return render(
          reverseSnippet({
            ...reverseSnippetOptions,
            hit: this,
          })
        );
      } catch (error) {
        throw new Error(`
  The reverseSnippet helper expects a JSON object of the format:
  { "attribute": "name", "highlightedTagName": "mark" }`);
      }
    },
    insights(this: Hit, options, render) {
      try {
        type InsightsHelperOptions = {
          method: InsightsClientMethod;
          payload: Partial<InsightsClientPayload>;
        };
        const { method, payload }: InsightsHelperOptions = JSON.parse(options);

        return render(
          insights(method, { objectIDs: [this.objectID], ...payload })
        );
      } catch (error) {
        throw new Error(`
The insights helper expects a JSON object of the format:
{ "method": "method-name", "payload": { "eventName": "name of the event" } }`);
      }
    },
  };
}
