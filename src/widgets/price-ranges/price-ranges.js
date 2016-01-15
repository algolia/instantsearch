import React from 'react';
import ReactDOM from 'react-dom';

import utils from '../../lib/utils.js';

import generateRanges from './generate-ranges.js';

import defaultTemplates from './defaultTemplates.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

let bem = utils.bemHelper('ais-price-ranges');
import cx from 'classnames';

/**
 * Instantiate a price ranges on a numerical facet
 * @function priceRanges
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {Object} [options.labels] Labels to use for the widget
 * @param  {string|Function} [options.labels.currency] Currency label
 * @param  {string|Function} [options.labels.separator] Separator label, between min and max
 * @param  {string|Function} [options.labels.button] Button label
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the wrapping list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to the active item element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.form] CSS class to add to the form element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each wrapping label of the form
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to each input of the form
 * @param  {string|string[]} [options.cssClasses.currency] CSS class to add to each currency element of the form
 * @param  {string|string[]} [options.cssClasses.separator] CSS class to add to the separator of the form
 * @param  {string|string[]} [options.cssClasses.button] CSS class to add to the submit button of the form
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @return {Object}
 */
const usage = `Usage:
priceRanges({
  container,
  attributeName,
  [ cssClasses.{root,header,body,list,item,active,link,form,label,input,currency,separator,button,footer} ],
  [ templates.{header,item,footer} ],
  [ labels.{currency,separator,button} ],
  [ autoHideContainer=true ]
})`;
function priceRanges({
    container,
    attributeName,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    labels = {
      currency: '$',
      button: 'Go',
      separator: 'to'
    },
    autoHideContainer = true
  } = {}) {
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let PriceRanges = headerFooterHOC(require('../../components/PriceRanges/PriceRanges.js'));
  if (autoHideContainer === true) {
    PriceRanges = autoHideContainerHOC(PriceRanges);
  }

  return {
    getConfiguration: () => ({
      facets: [attributeName]
    }),

    _generateRanges: function(results) {
      let stats = results.getFacetStats(attributeName);
      return generateRanges(stats);
    },

    _extractRefinedRange: function(helper) {
      let refinements = helper.getRefinements(attributeName);
      let from;
      let to;

      if (refinements.length === 0) {
        return [];
      }

      refinements.forEach(v => {
        if (v.operator.indexOf('>') !== -1) {
          from = Math.floor(v.value[0]);
        } else if (v.operator.indexOf('<') !== -1) {
          to = Math.ceil(v.value[0]);
        }
      });
      return [{from, to, isRefined: true}];
    },

    _refine: function(helper, from, to) {
      let facetValues = this._extractRefinedRange(helper);

      helper.clearRefinements(attributeName);
      if (facetValues.length === 0 || facetValues[0].from !== from || facetValues[0].to !== to) {
        if (typeof from !== 'undefined') {
          helper.addNumericRefinement(attributeName, '>=', Math.floor(from));
        }
        if (typeof to !== 'undefined') {
          helper.addNumericRefinement(attributeName, '<=', Math.ceil(to));
        }
      }

      helper.search();
    },

    render: function({results, helper, templatesConfig, state, createURL}) {
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

      let hasNoRefinements = facetValues.length === 0;

      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        list: cx(bem('list'), userCssClasses.list),
        link: cx(bem('link'), userCssClasses.link),
        item: cx(bem('item'), userCssClasses.item),
        active: cx(bem('item', 'active'), userCssClasses.active),
        form: cx(bem('form'), userCssClasses.form),
        label: cx(bem('label'), userCssClasses.label),
        input: cx(bem('input'), userCssClasses.input),
        currency: cx(bem('currency'), userCssClasses.currency),
        button: cx(bem('button'), userCssClasses.button),
        separator: cx(bem('separator'), userCssClasses.separator),
        footer: cx(bem('footer'), userCssClasses.footer)
      };

      ReactDOM.render(
        <PriceRanges
          createURL={(from, to, isRefined) => {
            let newState = state.clearRefinements(attributeName);
            if (!isRefined) {
              if (typeof from !== 'undefined') {
                newState = newState.addNumericRefinement(attributeName, '>=', Math.floor(from));
              }
              if (typeof to !== 'undefined') {
                newState = newState.addNumericRefinement(attributeName, '<=', Math.ceil(to));
              }
            }
            return createURL(newState);
          }}
          cssClasses={cssClasses}
          facetValues={facetValues}
          labels={labels}
          refine={this._refine.bind(this, helper)}
          shouldAutoHideContainer={hasNoRefinements}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

export default priceRanges;
