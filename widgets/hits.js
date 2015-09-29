var React = require('react');

var utils = require('../lib/utils.js');

var bindProps = require('../decorators/bindProps');
var Template = require('../components/Template');

var defaultTemplates = {
  empty: 'No matching objects, try another search',
  hit: 'Object #{{objectID}}, this is the default `hits` template, you should provide one'
};

function hits({
    container = null,
    templates = defaultTemplates,
    transformData,
    hideWhenNoResults = false,
    hitsPerPage = 20
  }) {
  var Hits = require('../components/Hits');

  var containerNode = utils.getContainerNode(container);

  return {
    getConfiguration: () => ({hitsPerPage}),
    render: function({results, templatesConfig}) {
      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      React.render(
        <Hits
          hits={results.hits}
          results={results}
          Template={bindProps(Template, templateProps)}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={results.hits.length > 0}
        />,
        containerNode
      );
    }
  };
}

module.exports = hits;
