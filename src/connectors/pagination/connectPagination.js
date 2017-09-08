import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customPagination = connectPagination(function render(params, isFirstRendering) {
  // params = {
  //   createURL,
  //   currentRefinement,
  //   nbHits,
  //   nbPages,
  //   refine,
  //   widgetParams,
  // }
});
search.addWidget(
  customPagination({
    [ maxPages ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectPagination.html
`;

/**
 * @typedef {Object} CustomPaginationWidgetOptions
 * @property {number} [maxPages] The max number of pages to browse.
 */

/**
 * @typedef {Object} PaginationRenderingOptions
 * @property {function(page): string} createURL Creates URL's for the next state, the number is the page to generate the URL for.
 * @property {number} currentRefinement The number of the page currently displayed.
 * @property {number} nbHits The number of hits computed for the last query (can be approximated).
 * @property {number} nbPages The number of pages for the result set.
 * @property {function(page)} refine Sets the current page and trigger a search.
 * @property {Object} widgetParams All original `CustomPaginationWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Pagination** connector provides the logic to build a widget that will let the user
 * choose the current page of the results.
 *
 * @type {Connector}
 * @param {function(PaginationRenderingOptions, boolean)} renderFn Rendering function for the custom **Pagination** widget.
 * @return {function(CustomPaginationWidgetOptions)} Re-usable widget factory for a custom **Pagination** widget.
 * @example
 * // custom `renderFn` to render the custom Pagination widget
 * function renderFn(PaginationRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     PaginationRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   // remove event listeners before replacing markup
 *   PaginationRenderingOptions.widgetParams.containerNode
 *     .find('a[data-page]')
 *     .each(function() { $(this).off('click'); });
 *
 *   var pages = Array.apply(null, {length: PaginationRenderingOptions.nbPages})
 *     .map(Number.call, Number)
 *     .map(function(page) {
 *       return '<li style="display: inline-block; margin-right: 10px;">' +
 *         '<a href="' + PaginationRenderingOptions.createURL(page) + '" data-page="' + page + '">' +
 *         (parseInt(page) + 1) + '</a></li>';
 *     });
 *
 *   PaginationRenderingOptions.widgetParams.containerNode
 *     .find('ul')
 *     .html(pages);
 *
 *   PaginationRenderingOptions.widgetParams.containerNode
 *     .find('a[data-page]')
 *     .each(function() {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *         PaginationRenderingOptions.refine($(this).data('page'));
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to Pagination logic
 * var customPagination = instantsearch.connectors.connectPagination(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customPagination({
 *     containerNode: $('#custom-pagination-container'),
 *     maxPages: 20,
 *   })
 * );
 */
export default function connectPagination(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { maxPages } = widgetParams;

    return {
      init({ helper, createURL, instantSearchInstance }) {
        this.refine = page => {
          helper.setPage(page);
          helper.search();
        };

        this.createURL = state => page => createURL(state.setPage(page));

        renderFn(
          {
            createURL: this.createURL(helper.state),
            currentRefinement: helper.getPage() || 0,
            nbHits: 0,
            nbPages: 0,
            refine: this.refine,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      getMaxPage({ nbPages }) {
        return maxPages !== undefined ? Math.min(maxPages, nbPages) : nbPages;
      },

      render({ results, state, instantSearchInstance }) {
        renderFn(
          {
            createURL: this.createURL(state),
            currentRefinement: state.page,
            refine: this.refine,
            nbHits: results.nbHits,
            nbPages: this.getMaxPage(results),
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },
    };
  };
}
