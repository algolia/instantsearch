import {checkRendering} from '../../lib/utils.js';

/**
 * Display various stats about the current search state
 * @function stats
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.body] Body template, provided with `hasManyResults`,
 * `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbPages`, `page`, `processingTimeMS`, `query`
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData.body] Function to change the object passed to the `body` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @return {Object}
 */
const usage = `Usage:
var customStats = connectState(function render(params, isFirstRendering) {
  // params = {
  //   hitsPerPage,
  //   nbHits,
  //   nbPages,
  //   page,
  //   processingTimeMS,
  //   query,
  // }
});
search.addWidget(customStats());
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectStats.html`;

export default function connectStats(renderFn) {
  checkRendering(renderFn, usage);

  return () => ({
    init({helper, instantSearchInstance}) {
      renderFn({
        instantSearchInstance,
        hitsPerPage: helper.state.hitsPerPage,
        nbHits: 0,
        nbPages: 0,
        page: helper.state.page,
        processingTimeMS: -1,
        query: helper.state.query,
      }, true);
    },

    render({results, instantSearchInstance}) {
      renderFn({
        instantSearchInstance,
        hitsPerPage: results.hitsPerPage,
        nbHits: results.nbHits,
        nbPages: results.nbPages,
        page: results.page,
        processingTimeMS: results.processingTimeMS,
        query: results.query,
      }, false);
    },
  });
}
