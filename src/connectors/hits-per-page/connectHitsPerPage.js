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
 * @typedef {Object} Items
 * @property {number} value Number of hits to display per page.
 * @property {string} label Label to display in the option.
 * @property {boolean} isRefined Indicate if it's the current refined value.
 */

/**
 * @typedef {Object} HitsPerPageRenderingOptions
 * @property {Items} items Array of objects defining the different values and labels.
 * @property {function(number)} refine Sets the number of hits per page and trigger a search.
 * @property {boolean} hasNoResults True if there were no results in the last search.
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams Original HitsPerPageWidgetOptions forwarded to `renderFn`.
 */

/**
 * @typedef {Object} HitsPerPageWidgetOptions
 * @property {Items} items Array of objects defining the different values and labels.
 */

/**
 * **HitsPerPage** connector provides the logic to create connected components that will
 * allow a user to choose to display more or less results from Algolia.
 * @type {Connector}
 * @param {function(HitsPerPageRenderingOptions, boolean)} renderFn Render function for the custom HitsPerPage widget,
 * the boolean indicates if the current call is the first one / the one before the first search.
 * @return {function(HitsPerPageWidgetOptions)} a custom HitsPerPage widget factory
 * @example
 * var $ = window.$;
 * var instantsearch = window.instantsearch;
 *
 * // custom `renderFn` to render the custom HitsPerPage widget
 * function renderFn(HitsPerPageRenderingOptions) {
 *   if (isFirstRendering) {
 *     var markup = '<select></select>';
 *     containerNode.append(markup);
 *   }
 *
 *   const itemsHTML = items.map(({value, label, isRefined}) => `
 *     <option
 *       value="${value}"
 *       ${isRefined ? 'selected' : ''}
 *     >
 *       ${label}
 *     </option>
 *   `);
 *
 *   containerNode
 *     .find('select')
 *     .html(itemsHTML);
 *
 *   containerNode
 *     .find('select')
 *     .off('change')
 *     .on('change', e => { refine(e.target.value); });
 * }
 *
 * // connect `renderFn` to HitsPerPage logic
 * var customHitsPerPage = instantsearch.connectors.connectHitsPerPage(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customHitsPerPage({
 *     containerNode: $('#custom-hits-per-page-container'),
 *     items: [
 *       {value: 6, label: '6 per page'},
 *       {value: 12, label: '12 per page'},
 *       {value: 24, label: '24 per page'},
 *     ],
 *   })
 * );
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
              window.console.warn(
  `[Warning][hitsPerPageSelector] hitsPerPage not defined.
  You should probably use a \`hits\` widget or set the value \`hitsPerPage\`
  using the searchParameters attribute of the instantsearch constructor.`
              );
            }
          } else if (window.console) {
            window.console.warn(
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
