var React = require('react');

var utils = require('../../lib/widgetUtils.js');

function hits({container, cssClass, labels, maxPages}={}) {
  var Pagination = require('../../components/Pagination/');
  var containerNode = utils.getContainerNode(container);

  return {
    render: function(results, state, helper) {
      var nbPages = maxPages !== undefined ? maxPages : results.nbPages;

      React.render(
        <Pagination
          nbHits={results.nbHits}
          currentPage={results.page}
          nbPages={nbPages}
          setCurrentPage={helper.setCurrentPage.bind(helper)}
          cssClass={cssClass}
          labels={labels} />,
        containerNode
      );
    }
  };
}

module.exports = hits;
