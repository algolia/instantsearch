var React = require('react');

var utils = require('../lib/utils.js');

function hits({
    container = null,
    templates = {},
    transformData = {},
    hideWhenNoResults = false,
    hitsPerPage = 20
  }) {
  var Hits = require('../components/Hits');

  var containerNode = utils.getContainerNode(container);

  return {
    getConfiguration: () => ({hitsPerPage}),
    render: function({results, helper, templatesConfig}) {
      React.render(
        <Hits
          hits={results.hits}
          results={results}
          helper={helper}
          noResultsTemplate={templates.empty}
          noResultsTransformData={transformData.empty}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={results.hits.length > 0}
          hitTemplate={templates.hit}
          templatesConfig={templatesConfig}
          hitTransformData={transformData.hit}
        />,
        containerNode
      );
    }
  };
}

module.exports = hits;
