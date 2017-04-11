import some from 'lodash/some';

import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customHitsPerPage = connectHitsPerPage(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   refine,
  //   hasNoResults,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customHitsPerPage({
    items: [
      {value: 10, label: '10 results per page'},
      {value: 42, label: '42 results per page'},
    ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHitsPerPage.html
`;

/**
 * @typedef HitsPerPageRenderingOptions
 * @property {Object[]} items Array of objects defining the different values and labels
 * @property {number} items[0].value number of hits to display per page
 * @property {string} items[0].label Label to display in the option
 * @property {boolean} items[0].isRefined boolean to indicate current refined value
 * @property {function(number)} refine sets the number of hits per page and trigger a search
 * @property {boolean} hasNoResults true if there were no results in the last search
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * @typedef HitsPerPageWidgetOptions
 * @property {Object[]} items Array of objects defining the different values and labels
 * @property {number} items[0].value number of hits to display per page
 * @property {string} items[0].label Label to display in the option
 */

/**
 * Creates a custom HitsPerPage widget factory.
 * @param {function(HitsPerPageRenderingOptions, boolean)} renderFn function that renders the hits widget, the boolean indicates if the current call is the first one / the one before the first search.
 * @return {function(HitsPerPageWidgetOptions)} a custom HitsPerPage widget factory
 */
export default function connectHitsPerPage(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {items: userItems} = widgetParams;
    let items = userItems;

    if (!items) {
      throw new Error(usage);
    }

    return {
      init({helper, state, instantSearchInstance}) {
        const isCurrentInOptions = some(
          items,
          item => Number(state.hitsPerPage) === Number(item.value)
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
  `[Warning][hitsPerPageSelector] No item in \`items\`
  with \`value: hitsPerPage\` (hitsPerPage: ${state.hitsPerPage})`
            );
          }

          items = [{value: undefined, label: ''}, ...items];
        }

        this.setHitsPerPage = value => helper
          .setQueryParameter('hitsPerPage', value)
          .search();

        renderFn({
          items: this._transformItems(state),
          refine: this.setHitsPerPage,
          hasNoResults: true,
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      render({state, results, instantSearchInstance}) {
        const hasNoResults = results.nbHits === 0;

        renderFn({
          items: this._transformItems(state),
          refine: this.setHitsPerPage,
          hasNoResults,
          widgetParams,
          instantSearchInstance,
        }, false);
      },

      _transformItems({hitsPerPage}) {
        return items.map(item =>
          ({...item, isRefined: Number(item.value) === Number(hitsPerPage)}));
      },
    };
  };
}
