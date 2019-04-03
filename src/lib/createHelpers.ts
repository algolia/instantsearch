import { Omit } from '../types';
import {
  highlight,
  snippet,
  HighlightOptions,
  SnippetOptions,
} from '../helpers';

type HoganRenderer = (value: any) => string;

export default function hoganHelpers({
  numberLocale,
}: {
  numberLocale: string;
}) {
  return {
    formatNumber(value: number, render: HoganRenderer): string {
      return Number(render(value)).toLocaleString(numberLocale);
    },
    highlight(options: string, render: HoganRenderer): string {
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
    snippet(options: string, render: HoganRenderer): string {
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
  };
}
