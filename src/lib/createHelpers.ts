import {
  highlight,
  snippet,
  HighlightOptions,
  SnippetOptions,
  insights,
} from '../helpers';
import { Hit, InsightsClientMethod, InsightsClientPayload } from '../types';

type HoganRenderer = (value: any) => string;

interface HoganHelpers {
  formatNumber: (value: number, render: HoganRenderer) => string;
  highlight: (options: string, render: HoganRenderer) => string;
  snippet: (options: string, render: HoganRenderer) => string;
  insights: (options: string, render: HoganRenderer) => string;
}

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
