var React = require('react');

var utils = require('../lib/utils.js');
var autoHide = require('../decorators/autoHide');
var Pagination = autoHide(require('../components/Pagination/Pagination.js'));

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
