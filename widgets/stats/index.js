var React = require('react');

var utils = require('../../lib/utils.js');
var autoHide = require('../../decorators/autoHide');
var headerFooter = require('../../decorators/headerFooter');
var bindProps = require('../../decorators/bindProps');
var Stats = autoHide(headerFooter(require('../../components/Stats')));

var Template = require('../../components/Template');

var defaultTemplates = {
  header: '',
  body: require('./template.html'),
  footer: ''
};

/**
 * Display various stats about the current search state
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root
 * @param  {String|String[]} [options.cssClasses.root=null]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.body='<div>
  {{#hasNoResults}}No results{{/hasNoResults}}
  {{#hasOneResult}}1 result{{/hasOneResult}}
  {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
  <small>found in {{processingTimeMS}}ms</small>
</div>'] Body template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the `body` template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function stats({
    container = null,
    templates = defaultTemplates,
    transformData,
    hideWhenNoResults = true,
    cssClasses = {
      root: null
    }
  }) {
  var containerNode = utils.getContainerNode(container);

  if (container === null) {
    throw new Error('Usage: stats({container[, template, transformData]})');
  }

  return {
    render: function({results, templatesConfig}) {
      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      React.render(
        <Stats
          hasResults={results.hits.length > 0}
          hideWhenNoResults={hideWhenNoResults}
          hitsPerPage={results.hitsPerPage}
          cssClasses={cssClasses}
          nbHits={results.nbHits}
          nbPages={results.nbPages}
          page={results.page}
          processingTimeMS={results.processingTimeMS}
          query={results.query}
          Template={bindProps(Template, templateProps)}
        />,
        containerNode
      );
    }
  };
}

module.exports = stats;
