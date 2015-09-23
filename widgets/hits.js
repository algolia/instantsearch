var React = require('react');

var utils = require('../lib/utils.js');

function hits({
    container = null,
    templates = {},
    transformData = {},
    hideIfEmpty = false,
    hitsPerPage = 20
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
          noResultsTransformData={transformData.empty}
          hideIfEmpty={hideIfEmpty}
          hasResults={results.hits.length > 0}
          hitTemplate={templates.hit}
          hitTransformData={transformData.hit}
        />,
        containerNode
      );
    }
  };
}

module.exports = hits;
