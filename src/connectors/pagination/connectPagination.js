import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import Paginator from './Paginator';

const withUsage = createDocumentationMessageGenerator({
  name: 'pagination',
  connector: true,
});

/**
 * @typedef {Object} CustomPaginationWidgetOptions
 * @property {number} [totalPages] The total number of pages to browse.
 * @property {number} [padding = 3] The padding of pages to show around the current page
 */

/**
 * @typedef {Object} PaginationRenderingOptions
 * @property {function(page): string} createURL Creates URLs for the next state, the number is the page to generate the URL for.
 * @property {number} currentRefinement The number of the page currently displayed.
 * @property {number} nbHits The number of hits computed for the last query (can be approximated).
 * @property {number} nbPages The number of pages for the result set.
 * @property {number[]} pages The actual pages relevant to the current situation and padding
 * @property {boolean} isFirstPage true if the current page is also the first page
 * @property {boolean} isLastPage true if the current page is also the last page
 * @property {function(page)} refine Sets the current page and trigger a search.
 * @property {Object} widgetParams All original `CustomPaginationWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Pagination** connector provides the logic to build a widget that will let the user
 * choose the current page of the results.
 *
 * When using the pagination with Algolia, you should be aware that the engine won't provide you pages
 * beyond the 1000th hits by default. You can find more information on the [Algolia documentation](https://www.algolia.com/doc/guides/searching/pagination/#pagination-limitations).
 *
 * @type {Connector}
 * @param {function(PaginationRenderingOptions, boolean)} renderFn Rendering function for the custom **Pagination** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
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
 *   var pages = PaginationRenderingOptions.pages
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
 * search.addWidgets([
 *   customPagination({
 *     containerNode: $('#custom-pagination-container'),
 *     totalPages: 20,
 *     padding: 4,
 *   })
 * ]);
 */
export default function connectPagination(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { totalPages, padding = 3 } = widgetParams;

    const pager = new Paginator({
      currentPage: 0,
      total: 0,
      padding,
    });

    return {
      $$type: 'ais.pagination',

      init({ helper, createURL, instantSearchInstance }) {
        this.refine = page => {
          helper.setPage(page);
          helper.search();
        };

        this.createURL = state => page => createURL(state.setPage(page));

        renderFn(
          {
            createURL: this.createURL(helper.state),
            currentRefinement: helper.state.page || 0,
            nbHits: 0,
            nbPages: 0,
            pages: [],
            isFirstPage: true,
            isLastPage: true,
            refine: this.refine,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      getMaxPage({ nbPages }) {
        return totalPages !== undefined
          ? Math.min(totalPages, nbPages)
          : nbPages;
      },

      render({ results, state, instantSearchInstance }) {
        const page = state.page || 0;
        const nbPages = this.getMaxPage(results);
        pager.currentPage = page;
        pager.total = nbPages;

        renderFn(
          {
            createURL: this.createURL(state),
            currentRefinement: page,
            refine: this.refine,
            nbHits: results.nbHits,
            nbPages,
            pages: pager.pages(),
            isFirstPage: pager.isFirstPage(),
            isLastPage: pager.isLastPage(),
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('page', undefined);
      },

      getWidgetState(uiState, { searchParameters }) {
        const page = searchParameters.page || 0;

        if (!page) {
          return uiState;
        }

        return {
          ...uiState,
          page: page + 1,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const page = uiState.page ? uiState.page - 1 : 0;

        return searchParameters.setQueryParameter('page', page);
      },
    };
  };
}
