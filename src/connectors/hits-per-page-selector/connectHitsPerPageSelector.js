import some from 'lodash/some';

import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customHitsPerPage = connectHitsPerPageSelector(function render(params, isFirstRendering) {
  // params = {
  //   options,
  //   currentRefinement,
  //   refine,
  //   hasNoResults,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customHitsPerPage({
    options: [
      {value: 10, label: '10 results per page'},
      {value: 42, label: '42 results per page'},
    ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHitsPerPageSelector.html
`;

/**
 * @typedef HitsPerPageRenderingOptions
 * @property {Object[]} options Array of objects defining the different values and labels
 * @property {number} options[0].value number of hits to display per page
 * @property {string} options[0].label Label to display in the option
 * @property {number} currentRefinement the currently selected value of hitsPerPage
 * @property {function(number)} refine sets the number of hits per page and trigger a search
 * @property {boolean} hasNoResults true if there were no results in the last search
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * @typedef HitsPerPageWidgetOptions
 * @property {Object[]} options Array of objects defining the different values and labels
 * @property {number} options[0].value number of hits to display per page
 * @property {string} options[0].label Label to display in the option
 */

/**
 * Creates a custom HitsPerPage widget factory.
 * @param {function(HitsPerPageRenderingOptions, boolean)} renderFn function that renders the hits widget
 * @return {function(HitsPerPageWidgetOptions)} a custom HitsPerPage widget factory
 */
export default function connectHitsPerPageSelector(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {options: userOptions} = widgetParams;
    let options = userOptions;

    if (!options) {
      throw new Error(usage);
    }

    return {
      init({helper, state, instantSearchInstance}) {
        const isCurrentInOptions = some(
          options,
          option => Number(state.hitsPerPage) === Number(option.value)
        );

        if (!isCurrentInOptions) {
          if (state.hitsPerPage === undefined) {
            if (window.console) {
              window.console.log(
  `[Warning][hitsPerPageSelector] hitsPerPage not defined.
  You should probably use a \`hits\` widget or set the value \`hitsPerPage\`
  using the searchParameters attribute of the instantsearch constructor.`
              );
            }
          } else if (window.console) {
            window.console.log(
  `[Warning][hitsPerPageSelector] No option in \`options\`
  with \`value: hitsPerPage\` (hitsPerPage: ${state.hitsPerPage})`
            );
          }

          options = [{value: undefined, label: ''}].concat(options);
        }

        const currentRefinement = state.hitsPerPage;

        this.setHitsPerPage = value => helper
          .setQueryParameter('hitsPerPage', value)
          .search();

        renderFn({
          currentRefinement,
          options,
          refine: this.setHitsPerPage,
          hasNoResults: true,
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      render({state, results, instantSearchInstance}) {
        const currentRefinement = state.hitsPerPage;
        const hasNoResults = results.nbHits === 0;

        renderFn({
          currentRefinement,
          options,
          refine: this.setHitsPerPage,
          hasNoResults,
          widgetParams,
          instantSearchInstance,
        }, false);
      },
    };
  };
}
