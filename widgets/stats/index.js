var React = require('react');

var utils = require('../../lib/utils.js');
var autoHide = require('../../decorators/autoHide');
var Stats = autoHide(require('../../components/Stats'));

function stats({
    container = null,
    template = null,
    transformData = null,
    hideWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);
  var defaultTemplate = require('./template.html');

  if (container === null) {
    throw new Error('Usage: stats({container[, template, transformData]})');
  }

  return {
    render: function({results, templatesConfig}) {
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
          template={template}
          defaultTemplate={defaultTemplate}
          templatesConfig={templatesConfig}
          transformData={transformData}
        />,
        containerNode
      );
    }
  };
}

module.exports = stats;
