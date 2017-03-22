import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customPagination = connectPagination(function render(params, isFirstRendering) {
  // params = {
  //   createURL,
  //   currentPage,
  //   nbHits,
  //   nbPages,
  //   setPage,
  // }
});
search.addWidget(
  customPagination({
    [maxPages]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectPagination.html
`;

/**
 * @typedef CustomPaginationWidgetOptions
 * @param {number} maxPages The max number of pages to browse
 */

/**
 * @typedef PaginationRenderingOptions
 * @property {function} createURL
 * @property {number} currentPage
 * @property {number} nbHits
 * @property {number} nbPages
 * @property {function} setPage
 */

 /**
  * Connects a rendering function with the pagination business logic.
  * @param {function(PaginationRenderingOptions)} renderFn function that renders the pagination widget
  * @return {function(CustomPaginationWidgetOptions)} a widget factory for pagination widget
  */
export default function connectPagination(renderFn) {
  checkRendering(renderFn, usage);

  return ({maxPages}) => ({
    init({helper, createURL}) {
      this.setPage = page => {
        helper.setPage(page);
        helper.search();
      };

      this.createURL = state => page => createURL(state.setPage(page));

      renderFn({
        createURL: this.createURL(helper.state),
        currentPage: helper.getPage() || 0,
        nbHits: 0,
        nbPages: 0,
        setPage: this.setPage,
      }, true);
    },

    getMaxPage({nbPages}) {
      return maxPages !== undefined
        ? Math.min(maxPages, nbPages)
        : nbPages;
    },

    render({results, state}) {
      renderFn({
        createURL: this.createURL(state),
        currentPage: state.page,
        setPage: this.setPage,
        nbHits: results.nbHits,
        nbPages: this.getMaxPage(results),
      }, false);
    },
  });
}
