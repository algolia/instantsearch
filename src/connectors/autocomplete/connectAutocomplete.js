import escapeHits, { tagConfig } from '../../lib/escape-highlight';
import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customAutcomplete = connectAutocomplete(function render(params, isFirstRendering) {
  // params = {
  //   indices,
  //   refine,
  //   currentRefinement
  // }
});
search.addWiget(customAutcomplete({
  [ indices ],
  [ escapeHits = false ]
}));
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectAutocomplete.html
`;

export default function connectAutocomplete(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { indices } = widgetParams;

    if (indices && !Array.isArray(indices)) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return widgetParams.escapeHits ? tagConfig : undefined;
      },

      init({ instantSearchInstance, helper }) {
        this._refine = this.refine(helper);

        this.indices = [
          {
            helper,
            label: 'primary',
            index: helper.getIndex(),
            results: undefined,
          },
        ];

        // add additionnal indices into `this.indices`
        if (indices && Array.isArray(indices)) {
          indices.forEach(({ label, value }) => {
            const derivedHelper = helper.derive(searchParameters =>
              searchParameters.setIndex(value)
            );

            this.indices.push({
              label,
              index: value,
              helper: derivedHelper,
              results: undefined,
            });

            // update results then trigger render after a search from any helper
            derivedHelper.on('result', results =>
              this.saveResults({ results, index: value })
            );
          });
        }

        this.instantSearchInstance = instantSearchInstance;
        this.renderWithAllIndices({ isFirstRendering: true });
      },

      saveResults({ results, index }) {
        const derivedIndex = this.indices.find(i => i.index === index);

        if (
          widgetParams.escapeHits &&
          results.hits &&
          results.hits.length > 0
        ) {
          results.hits = escapeHits(results.hits);
        }

        derivedIndex.results = results;
        derivedIndex.hits = results ? results.hits : undefined;

        this.renderWithAllIndices();
      },

      refine(helper) {
        return query => helper.setQuery(query).search();
      },

      render({ results }) {
        this.saveResults({ results, index: this.indices[0].index });
      },

      renderWithAllIndices({ isFirstRendering = false } = {}) {
        renderFn(
          {
            widgetParams,
            indices: this.indices,
            instantSearchInstance: this.instantSearchInstance,
            refine: this._refine,
          },
          isFirstRendering
        );
      },

      dispose() {
        // remove `result` listeners for derived helper
        this.indices
          .slice(1)
          .forEach(({ helper }) => helper.removeAllListeners('result'));

        unmountFn();
      },
    };
  };
}
