import {
  highlight,
  snippet,
  HighlightOptions,
  SnippetOptions,
} from '../helpers';

type HoganRenderer = (value: any) => string;

interface HoganHelpers {
  formatNumber: (value: number, render: HoganRenderer) => string;
  highlight: (options: string, render: HoganRenderer) => string;
  snippet: (options: string, render: HoganRenderer) => string;
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
  };
}
