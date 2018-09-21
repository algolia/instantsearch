import highlight from './highlight';

export default function({ numberLocale }) {
  return {
    formatNumber(number, render) {
      return Number(render(number)).toLocaleString(numberLocale);
    },
    highlight(options, render) {
      try {
        const highlightOptions = JSON.parse(options);

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
  };
}
