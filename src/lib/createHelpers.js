import {
  highlight,
  snippet,
  clickedObjectIDsAfterSearch,
  convertedObjectIDsAfterSearch,
} from '../helpers';

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
    snippet(options, render) {
      try {
        const snippetOptions = JSON.parse(options);

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
    // did not namespace theses for now because it overcomplicates the code
    clickedObjectIDsAfterSearch(payload, render) {
      return render(
        clickedObjectIDsAfterSearch({
          objectID: this.objectID,
          payload,
        })
      );
    },
    convertedObjectIDsAfterSearch(payload, render) {
      return render(
        convertedObjectIDsAfterSearch({
          objectID: this.objectID,
          payload,
        })
      );
    },
  };
}
