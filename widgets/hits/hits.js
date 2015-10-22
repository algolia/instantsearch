var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var bem = utils.bemHelper('ais-hits');
var cx = require('classnames/dedupe');

var Hits = require('../../components/Hits');
var defaultTemplates = require('./defaultTemplates');

/**
 * Display the list of results (hits) from the current search
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {String} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {String} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {String} [options.cssClasses.item] CSS class to add to each result
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.empty=''] Template to use when there are no results.
 * @param  {String|Function} [options.templates.item=''] Template to use for each result.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty=''] Method used to change the object passed to the empty template
 * @param  {Function} [options.transformData.item=''] Method used to change the object passed to the item template
 * @param  {Number} [hitsPerPage=20] The number of hits to display per page
 * @return {Object}
 */
function hits({
    container,
    cssClasses = {},
    templates = defaultTemplates,
    transformData,
    hitsPerPage = 20
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: hits({container, [cssClasses.{root,empty,item}, templates.{empty,item}, transformData.{empty,item}, hitsPerPage])';

  if (container === null) {
    throw new Error(usage);
  }

  cssClasses = {
    root: cx(bem(null), cssClasses.root),
    item: cx(bem('item'), cssClasses.item),
    empty: cx(bem(null, 'empty'), cssClasses.empty)
  };

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
          cssClasses={cssClasses}
          hits={results.hits}
          results={results}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

module.exports = hits;
