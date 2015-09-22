var React = require('react');

var utils = require('../lib/utils.js');

function pagination({container, cssClass, labels, maxPages, showFirstLast} = {}) {
  var Pagination = require('../components/Pagination/Pagination.js');

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
          labels={labels}
          showFirstLast={showFirstLast}
        />,
        containerNode
      );
    }
  };
}

module.exports = pagination;
