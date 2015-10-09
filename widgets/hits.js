var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../lib/utils.js');

var bindProps = require('../decorators/bindProps');
var Template = require('../components/Template');

var defaultTemplates = {
  empty: 'No results',
  hit: function(data) {
    return JSON.stringify(data, null, 2);
  }
};

/**
 * Display the list of results (hits) from the current search
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.empty=''] Template to use when there are no results.
 * Gets passed the `result` from the API call.
 * @param  {String|Function} [options.templates.hit=''] Template to use for each result.
 * Gets passed the `hit` of the result.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty=''] Method used to change the object passed to the empty template
 * @param  {Function} [options.transformData.hit=''] Method used to change the object passed to the hit template
 * @param  {Number} [hitsPerPage=20] The number of hits to display per page
 * @return {Object}
 */
function hits({
    container,
    templates = defaultTemplates,
    transformData,
    hitsPerPage = 20
  }) {
  var Hits = require('../components/Hits');

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: hits({container, [templates.{empty,hit}, transformData.{empty,hit}, hitsPerPage])';

  if (container === null) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({hitsPerPage}),
    render: function({results, templatesConfig}) {
      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      ReactDOM.render(
        <Hits
          Template={bindProps(Template, templateProps)}
          hits={results.hits}
          results={results}
        />,
        containerNode
      );
    }
  };
}

module.exports = hits;
