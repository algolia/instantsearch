var React = require('react');

var utils = require('../lib/utils.js');
var autoHide = require('../decorators/autoHide');
var Pagination = autoHide(require('../components/Pagination/Pagination.js'));

/**
 * Add a pagination menu to navigate through the results
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String|String[]} [options.cssClass] CSS class to be added to the wrapper element
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {String} [options.labels.prev] Label for the Previous link
 * @param  {String} [options.labels.next] Label for the Next link
 * @param  {String} [options.labels.first] Label for the First link
 * @param  {String} [options.labels.last] Label for the Last link
 * @param  {Number} [maxPages=20] The max number of pages to browse
 * @param  {boolean} [showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function pagination({
    container = null,
    cssClass,
    labels,
    maxPages,
    showFirstLast,
    hideWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);

  return {
    render: function({results, helper}) {
      var nbPages = results.nbPages;
      if (maxPages !== undefined) {
        nbPages = Math.min(maxPages, results.nbPages);
      }

      React.render(
        <Pagination
          nbHits={results.nbHits}
          currentPage={results.page}
          nbPages={nbPages}
          setCurrentPage={helper.setCurrentPage.bind(helper)}
          cssClass={cssClass}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={results.hits.length > 0}
          labels={labels}
          showFirstLast={showFirstLast}
        />,
        containerNode
      );
    }
  };
}

module.exports = pagination;
