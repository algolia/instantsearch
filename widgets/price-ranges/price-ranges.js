var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');

var generateRanges = require('./generate-ranges.js');

var defaultTemplates = require('./defaultTemplates');
var autoHideContainer = require('../../decorators/autoHideContainer');
var headerFooter = require('../../decorators/headerFooter');

var bem = utils.bemHelper('ais-price-ranges');
var cx = require('classnames/dedupe');

/**
 * Instantiate a price ranges on a numerical facet
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, range
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.form] CSS class to add to the form element
 * @param  {string|string[]} [options.cssClasses.range] CSS class to add to the range element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to the active range element
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to the min/max input elements
 * @param  {string|string[]} [options.cssClasses.button] CSS class to add to the button element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.range] Range template
 * @param  {Object} [options.labels] Labels to use for the widget
 * @param  {string|Function} [options.labels.button] Button label
 * @param  {string|Function} [options.labels.currency] Currency label
 * @param  {string|Function} [options.labels.to] To label
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function priceRanges({
    container = null,
    facetName = null,
    cssClasses = {},
    templates = defaultTemplates,
    labels = {
      currency: '$',
      button: 'Go',
      to: 'to'
    },
    hideContainerWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: priceRanges({container, facetName, [cssClasses, templates, labels]})';

  if (container === null || facetName === null) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      facets: [facetName]
    }),

    _generateRanges: function(results) {
      var stats = results.getFacetStats(facetName);
      return generateRanges(stats);
    },

    _extractRefinedRange: function(helper) {
      var refinements = helper.getRefinements(facetName);
      var from;
      var to;

      if (refinements.length === 0) {
        return [];
      }

      refinements.forEach(v => {
        if (v.operator.indexOf('>') !== -1) {
          from = v.value[0] + 1;
        } else if (v.operator.indexOf('<') !== -1) {
          to = v.value[0] - 1;
        }
      });
      return [{from, to, isRefined: true}];
    },

    _refine: function(helper, from, to) {
      var facetValues = this._extractRefinedRange(helper);

      helper.clearRefinements(facetName);
      if (facetValues.length === 0 || facetValues[0].from !== from || facetValues[0].to !== to) {
        if (typeof from !== 'undefined') {
          helper.addNumericRefinement(facetName, '>', from - 1);
        }
        if (typeof to !== 'undefined') {
          helper.addNumericRefinement(facetName, '<', to + 1);
        }
      }

      helper.search();
    },

    render: function({results, helper, templatesConfig, state, createURL}) {
      var PriceRanges = autoHideContainer(headerFooter(require('../../components/PriceRanges')));
      var facetValues;

      if (results.hits.length > 0) {
        facetValues = this._extractRefinedRange(helper);

        if (facetValues.length === 0) {
          facetValues = this._generateRanges(results);
        }
      } else {
        facetValues = [];
      }

      var templateProps = utils.prepareTemplateProps({
        defaultTemplates,
        templatesConfig,
        templates
      });

      cssClasses = {
        root: cx(bem(null), cssClasses.root),
        header: cx(bem('header'), cssClasses.header),
        body: cx(bem('body'), cssClasses.body),
        footer: cx(bem('footer'), cssClasses.footer),
        range: cx(bem('range'), cssClasses.range),
        active: cx(bem('range', 'active'), cssClasses.active),
        input: cx(bem('input'), cssClasses.input),
        form: cx(bem('form'), cssClasses.form),
        button: cx(bem('button'), cssClasses.button)
      };

      ReactDOM.render(
        <PriceRanges
          createURL={(from, to, isRefined) => {
            var newState = state.clearRefinements(facetName);
            if (!isRefined) {
              if (typeof from !== 'undefined') {
                newState = newState.addNumericRefinement(facetName, '>', from - 1);
              }
              if (typeof to !== 'undefined') {
                newState = newState.addNumericRefinement(facetName, '<', to + 1);
              }
            }
            return createURL(newState);
          }}
          cssClasses={cssClasses}
          facetValues={facetValues}
          hasResults={results.hits.length > 0}
          hideContainerWhenNoResults={hideContainerWhenNoResults}
          labels={labels}
          refine={this._refine.bind(this, helper)}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

module.exports = priceRanges;
