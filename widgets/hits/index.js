'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils');

function hits(parameters) {
  var Results = require('../../components/Results');
  var containerNode = utils.getContainerNode(parameters.container);

  return {
    render: function(results, state, helper) {
      React.render(<Results results={ results }
                      searchState={ state }
                      helper={ helper }
                      noResultsTemplate={ parameters.templates["no-results"] }
                      hitTemplate={ parameters.templates["hit"] } />,
                   containerNode);
    }
  };
}


module.exports = hits;
