var React = require('react');

var utils = require('../../lib/utils.js');
var defaultTemplate = require('./template.html');
var autoHide = require('../../decorators/autoHide');
var Stats = autoHide(require('../../components/Stats'));

function stats({
    container = null,
    template = defaultTemplate,
    transformData = null,
    hideWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);

  if (container === null) {
    throw new Error('Usage: stats({container[, template, transformData]})');
  }

  return {
    render: function({results, templateHelpers}) {
      React.render(
        <Stats
          hasResults={results.hits.length > 0}
          hideWhenNoResults={hideWhenNoResults}
          hitsPerPage={results.hitsPerPage}
          nbHits={results.nbHits}
          nbPages={results.nbPages}
          page={results.page}
          processingTimeMS={results.processingTimeMS}
          query={results.query}
          templateHelpers={templateHelpers}
          template={template}
          transformData={transformData}
        />,
        containerNode
      );
    }
  };
}

module.exports = stats;
