var React = require('react');
var ReactDOM = require('react-dom');
var defaults = require('lodash/object/defaults');

var utils = require('../../lib/utils.js');
var autoHide = require('../../decorators/autoHide');
var defaultLabels = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»'
};

/**
 * Add a pagination menu to navigate through the results
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {String} [options.cssClasses.root] CSS classes added to the parent <ul>
 * @param  {String} [options.cssClasses.item] CSS classes added to each <li>
 * @param  {String} [options.cssClasses.page] CSS classes added to page <li>
 * @param  {String} [options.cssClasses.previous] CSS classes added to the previous <li>
 * @param  {String} [options.cssClasses.next] CSS classes added to the next <li>
 * @param  {String} [options.cssClasses.first] CSS classes added to the first <li>
 * @param  {String} [options.cssClasses.last] CSS classes added to the last <li>
 * @param  {String} [options.cssClasses.active] CSS classes added to the active <li>
 * @param  {String} [options.cssClasses.disabled] CSS classes added to the disabled <li>
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {String} [options.labels.previous] Label for the Previous link
 * @param  {String} [options.labels.next] Label for the Next link
 * @param  {String} [options.labels.first] Label for the First link
 * @param  {String} [options.labels.last] Label for the Last link
 * @param  {Number} [options.maxPages=20] The max number of pages to browse
 * @param  {Number} [options.padding=3] The number of pages to display on each side of the current page
 * @param  {String|DOMElement|boolean} [options.scrollTo='body'] Where to scroll after a click, set to `false` to disable
 * @param  {boolean} [options.showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [options.hideWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function pagination({
    container,
    cssClasses = {},
    labels = {},
    maxPages = 20,
    padding = 3,
    showFirstLast = true,
    hideWhenNoResults = true,
    scrollTo = 'body'
  }) {
  if (scrollTo === true) {
    scrollTo = 'body';
  }

  var containerNode = utils.getContainerNode(container);
  var scrollToNode = scrollTo !== false ? utils.getContainerNode(scrollTo) : false;

  if (!container) {
    throw new Error('Usage: pagination({container[, cssClasses.{root,item,page,previous,next,first,last,active,disabled}, labels.{previous,next,first,last}, maxPages, showFirstLast, hideWhenNoResults]})');
  }

  labels = defaults(labels, defaultLabels);

  return {
    setCurrentPage: function(helper, pageNumber) {
      helper.setCurrentPage(pageNumber);
      if (scrollToNode !== false) {
        scrollToNode.scrollIntoView();
      }
      helper.search();
    },

    render: function({results, helper, createURL, state}) {
      var currentPage = results.page;
      var nbPages = results.nbPages;
      var nbHits = results.nbHits;
      var hasResults = nbHits > 0;

      if (maxPages !== undefined) {
        nbPages = Math.min(maxPages, results.nbPages);
      }

      var Pagination = autoHide(require('../../components/Pagination/Pagination.js'));
      ReactDOM.render(
        <Pagination
          createURL={(page) => createURL(state.setPage(page))}
          cssClasses={cssClasses}
          currentPage={currentPage}
          hasResults={hasResults}
          hideWhenNoResults={hideWhenNoResults}
          labels={labels}
          nbHits={nbHits}
          nbPages={nbPages}
          padding={padding}
          setCurrentPage={this.setCurrentPage.bind(this, helper)}
          showFirstLast={showFirstLast}
        />,
        containerNode
      );
    }
  };
}

module.exports = pagination;
