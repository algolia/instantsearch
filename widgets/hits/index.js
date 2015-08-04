'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils.js');

function hits(params) {
  var Results = require('../../components/Results');
  var containerNode = utils.getContainerNode(params.container);

  return {
    render: function(results, state, helper) {
      React.render(
        <Results results={results}
          helper={helper}
          noResultsTemplate={params.templates.noResults}
          hitTemplate={params.templates.hit} />,
        containerNode
      );
    }
  };
}

module.exports = hits;
