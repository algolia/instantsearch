var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var autoHideContainer = require('../../decorators/autoHideContainer');
var headerFooter = require('../../decorators/headerFooter');
var bem = require('../../lib/utils').bemHelper('ais-stats');
var cx = require('classnames/dedupe');

var defaultTemplates = require('./defaultTemplates.js');

/**
 * Display various stats about the current search state
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {String} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String} [options.cssClasses.header] CSS class to add to the header element
 * @param  {String} [options.cssClasses.body] CSS class to add to the body element
 * @param  {String} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {String} [options.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.body] Body template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the `body` template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function stats({
    container,
    cssClasses = {},
    hideContainerWhenNoResults = true,
    templates = defaultTemplates,
    transformData
  }) {
  var containerNode = utils.getContainerNode(container);

  if (!containerNode) {
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

      var Stats = autoHideContainer(headerFooter(require('../../components/Stats/Stats.js')));

      cssClasses = {
        body: cx(bem('body'), cssClasses.body),
        footer: cx(bem('footer'), cssClasses.footer),
        header: cx(bem('header'), cssClasses.header),
        root: cx(bem(null), cssClasses.root),
        time: cx(bem('time'), cssClasses.time)
      };

      ReactDOM.render(
        <Stats
          cssClasses={cssClasses}
          hasResults={results.hits.length > 0}
          hideContainerWhenNoResults={hideContainerWhenNoResults}
          hitsPerPage={results.hitsPerPage}
          nbHits={results.nbHits}
          nbPages={results.nbPages}
          page={results.page}
          processingTimeMS={results.processingTimeMS}
          query={results.query}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

module.exports = stats;
