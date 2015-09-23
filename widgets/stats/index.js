var React = require('react');

var utils = require('../../lib/utils.js');
var defaultTemplate = require('./template.html');

function stats({
    container = null,
    template = defaultTemplate,
    hideIfEmpty = true
  }) {
  var Stats = require('../../components/Stats');
  var containerNode = utils.getContainerNode(container);

  if (container === null) {
    throw new Error('Usage: stats({container})');
  }

  return {
    render: function({results, templateHelpers}) {
      React.render(
        <Stats
          hasResults={results.hits.length > 0}
          hideIfEmpty={hideIfEmpty}
          hitsPerPage={results.hitsPerPage}
          nbHits={results.nbHits}
          nbPages={results.nbPages}
          page={results.page}
          processingTimeMS={results.processingTimeMS}
          query={results.query}
          templateHelpers={templateHelpers}
          template={template}
        />,
        containerNode
      );
    }
  };
}

module.exports = stats;
