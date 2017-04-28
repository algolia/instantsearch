import {checkRendering} from '../../lib/utils.js';

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
 * @property {number} [maxPages] The max number of pages to browse
 */

/**
 * @typedef PaginationRenderingOptions
 * @property {function(number)} createURL create URL's for the next state, the number is the page to generate the URL for
 * @property {number} currentRefinement the number of the page currently displayed
 * @property {number} nbHits the number of hits computed for the last query (can be approximated)
 * @property {number} nbPages the number of pages for the result set
 * @property {function} refine set the current page and trigger a search
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 */

 /**
  * Connects a rendering function with the pagination business logic.
  * @type {Connector}
  * @param {function(PaginationRenderingOptions, boolean)} renderFn function that renders the pagination widget
  * @return {function(CustomPaginationWidgetOptions)} a widget factory for pagination widget
  */
export default function connectPagination(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {maxPages} = widgetParams;

    return {
      init({helper, createURL, instantSearchInstance}) {
        this.refine = page => {
          helper.setPage(page);
          helper.search();
        };

        this.createURL = state => page => createURL(state.setPage(page));

        renderFn({
          createURL: this.createURL(helper.state),
          currentRefinement: helper.getPage() || 0,
          nbHits: 0,
          nbPages: 0,
          refine: this.refine,
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      getMaxPage({nbPages}) {
        return maxPages !== undefined
          ? Math.min(maxPages, nbPages)
          : nbPages;
      },

      render({results, state, instantSearchInstance}) {
        renderFn({
          createURL: this.createURL(state),
          currentRefinement: state.page,
          refine: this.refine,
          nbHits: results.nbHits,
          nbPages: this.getMaxPage(results),
          widgetParams,
          instantSearchInstance,
        }, false);
      },
    };
  };
}
