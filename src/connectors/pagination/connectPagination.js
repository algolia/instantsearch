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
 * Add a pagination menu to navigate through the results
 * @function pagination
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {string} [options.labels.previous] Label for the Previous link
 * @param  {string} [options.labels.next] Label for the Next link
 * @param  {string} [options.labels.first] Label for the First link
 * @param  {string} [options.labels.last] Label for the Last link
 * @param  {number} [options.maxPages] The max number of pages to browse
 * @param  {number} [options.padding=3] The number of pages to display on each side of the current page
 * @param  {string|DOMElement|boolean} [options.scrollTo='body'] Where to scroll after a click, set to `false` to disable
 * @param  {boolean} [options.showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<ul>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<li>`
 * @param  {string|string[]} [options.cssClasses.link] CSS classes added to each link
 * @param  {string|string[]} [options.cssClasses.page] CSS classes added to page `<li>`
 * @param  {string|string[]} [options.cssClasses.previous] CSS classes added to the previous `<li>`
 * @param  {string|string[]} [options.cssClasses.next] CSS classes added to the next `<li>`
 * @param  {string|string[]} [options.cssClasses.first] CSS classes added to the first `<li>`
 * @param  {string|string[]} [options.cssClasses.last] CSS classes added to the last `<li>`
 * @param  {string|string[]} [options.cssClasses.active] CSS classes added to the active `<li>`
 * @param  {string|string[]} [options.cssClasses.disabled] CSS classes added to the disabled `<li>`
 * @return {Object} widget
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
