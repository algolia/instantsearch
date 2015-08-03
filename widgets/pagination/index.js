'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils.js');

function hits(params) {
  var Pagination = require('../../components/Pagination/');
  var containerNode = utils.getContainerNode(params.container);

  return {
    render: function(results, state, helper) {
      React.render(
        <Pagination
          nbHits={results.nbHits}
          currentPage={results.page}
          nbPages={results.nbPages}
          setCurrentPage={helper.setCurrentPage.bind(helper)}
          cssClass={params.cssClass}
          labels={params.labels} />,
        containerNode
      );
    }
  };
}

module.exports = hits;
