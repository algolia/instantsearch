var React = require('react');

var utils = require('../lib/utils.js');

function hits({
    container = null,
    templates = {},
    hitsPerPage = 20,
    hideIfEmpty = false
  }) {
  var Hits = require('../components/Hits');

  var containerNode = utils.getContainerNode(container);

  return {
    getConfiguration: () => ({hitsPerPage}),
    render: function({results, helper}) {
      React.render(
        <Hits
          hits={results.hits}
          results={results}
          helper={helper}
          noResultsTemplate={templates.empty}
          hideIfEmpty={hideIfEmpty}
          hasResults={results.hits.length > 0}
          hitTemplate={templates.hit}
        />,
        containerNode
      );
    }
  };
}

module.exports = hits;
