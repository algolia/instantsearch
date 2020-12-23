import {
  highlight,
  reverseHighlight,
  snippet,
  reverseSnippet,
  HighlightOptions,
  ReverseHighlightOptions,
  SnippetOptions,
  ReverseSnippetOptions,
  insights,
} from '../helpers';
import { Hit, InsightsClientMethod, InsightsClientPayload } from '../types';

type HoganRenderer = (value: any) => string;

type HoganHelpers = {
  formatNumber: (value: number, render: HoganRenderer) => string;
  highlight: (options: string, render: HoganRenderer) => string;
  reverseHighlight: (options: string, render: HoganRenderer) => string;
  snippet: (options: string, render: HoganRenderer) => string;
  reverseSnippet: (options: string, render: HoganRenderer) => string;
  insights: (options: string, render: HoganRenderer) => string;
};

export default function hoganHelpers({
  numberLocale,
}: {
  numberLocale?: string;
}): HoganHelpers {
  return {
    formatNumber(value, render) {
      return Number(render(value)).toLocaleString(numberLocale);
    },
    highlight(options, render) {
      try {
        const highlightOptions: Omit<HighlightOptions, 'hit'> = JSON.parse(
          options
        );

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
        const reverseHighlightOptions: Omit<
          ReverseHighlightOptions,
          'hit'
        > = JSON.parse(options);

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
        const reverseSnippetOptions: Omit<
          ReverseSnippetOptions,
          'hit'
        > = JSON.parse(options);

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
