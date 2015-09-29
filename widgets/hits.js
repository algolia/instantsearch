var React = require('react');

var utils = require('../lib/utils.js');

var bindProps = require('../decorators/bindProps');
var Template = require('../components/Template');

var defaultTemplates = {
  empty: 'No matching objects, try another search',
  hit: 'Object #{{objectID}}, this is the default `hits` template, you should provide one'
};

/**
 * Display the list of results (hits) from the current search
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.empty=''] Template to use when there are no result
 * @param  {String|Function} [options.templates.hit=''] Template to use for each result
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty=''] Method used to change the object passed to the empty template
 * @param  {Function} [options.transformData.hit=''] Method used to change the object passed to the hit template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
 * @param  {Number} [hitsPerPage=20] The number of hits to display per page
 * @return {Object}
 */
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
