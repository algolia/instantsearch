let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils.js');

let generateRanges = require('./generate-ranges.js');

let defaultTemplates = require('./defaultTemplates');
let autoHideContainer = require('../../decorators/autoHideContainer');
let headerFooter = require('../../decorators/headerFooter');

let bem = utils.bemHelper('ais-price-ranges');
let cx = require('classnames/dedupe');

/**
 * Instantiate a price ranges on a numerical facet
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string} [options.cssClasses.list] CSS class to add to the wrapping list element
 * @param  {string} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string} [options.cssClasses.active] CSS class to add to the active item element
 * @param  {string} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string} [options.cssClasses.form] CSS class to add to the form element
 * @param  {string} [options.cssClasses.label] CSS class to add to each wrapping label of the form
 * @param  {string} [options.cssClasses.input] CSS class to add to each input of the form
 * @param  {string} [options.cssClasses.currency] CSS class to add to each currency element of the form
 * @param  {string} [options.cssClasses.separator] CSS class to add to the separator of the form
 * @param  {string} [options.cssClasses.button] CSS class to add to the submit button of the form
 * @param  {string} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {Object} [options.labels] Labels to use for the widget
 * @param  {string|Function} [options.labels.currency] Currency label
 * @param  {string|Function} [options.labels.separator] Separator labe, between min and max
 * @param  {string|Function} [options.labels.button] Button label
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function priceRanges({
    container,
    facetName,
    cssClasses = {},
    templates = defaultTemplates,
    labels = {
      currency: '$',
      button: 'Go',
      separator: 'to'
    },
    hideContainerWhenNoResults = true
  }) {
  let containerNode = utils.getContainerNode(container);
  let usage = 'Usage: priceRanges({container, facetName, [cssClasses.{root,header,body,list,item,active,link,form,label,input,currency,separator,button,footer}, templates.{header,item,footer}, labels.{currency,separator,button}, hideContainerWhenNoResults]})';

  let PriceRanges = headerFooter(require('../../components/PriceRanges/PriceRanges'));
  if (hideContainerWhenNoResults === true) {
    PriceRanges = autoHideContainer(PriceRanges);
  }

  if (!container || !facetName) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      facets: [facetName]
    }),

    _generateRanges: function(results) {
      let stats = results.getFacetStats(facetName);
      return generateRanges(stats);
    },

    _extractRefinedRange: function(helper) {
      let refinements = helper.getRefinements(facetName);
      let from;
      let to;

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
      let facetValues = this._extractRefinedRange(helper);

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
      let hasNoResults = results.nbHits === 0;
      let facetValues;

      if (results.hits.length > 0) {
        facetValues = this._extractRefinedRange(helper);

        if (facetValues.length === 0) {
          facetValues = this._generateRanges(results);
        }
      } else {
        facetValues = [];
      }

      let templateProps = utils.prepareTemplateProps({
        defaultTemplates,
        templatesConfig,
        templates
      });

      cssClasses = {
        root: cx(bem(null), cssClasses.root),
        header: cx(bem('header'), cssClasses.header),
        body: cx(bem('body'), cssClasses.body),
        list: cx(bem('list'), cssClasses.list),
        link: cx(bem('link'), cssClasses.link),
        item: cx(bem('item'), cssClasses.item),
        active: cx(bem('item', 'active'), cssClasses.active),
        form: cx(bem('form'), cssClasses.form),
        label: cx(bem('label'), cssClasses.label),
        input: cx(bem('input'), cssClasses.input),
        currency: cx(bem('currency'), cssClasses.currency),
        button: cx(bem('button'), cssClasses.button),
        separator: cx(bem('separator'), cssClasses.separator),
        footer: cx(bem('footer'), cssClasses.footer)
      };

      ReactDOM.render(
        <PriceRanges
          createURL={(from, to, isRefined) => {
            let newState = state.clearRefinements(facetName);
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
          labels={labels}
          refine={this._refine.bind(this, helper)}
          shouldAutoHideContainer={hasNoResults}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

module.exports = priceRanges;
