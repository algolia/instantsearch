import {checkRendering} from '../../lib/utils.js';
import generateRanges from './generate-ranges.js';

const usage = `Usage:
var customPriceRanges = connectToggle(function render(params, isFirstRendering) {
  // params = {
  //   facetValues,
  //   refine,
  //   instantSearchInstance,
  // }
});
search.addWidget(
  customPriceRanges({
    attributeName,
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectPriceRanges.html
`;

/**
 * Instantiate a price ranges on a numerical facet
 * @function priceRanges
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.item] Item template. Template data: `from`, `to` and `currency`
 * @param  {string} [options.currency='$'] The currency to display
 * @param  {Object} [options.labels] Labels to use for the widget
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
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */

export default function connectPriceRanges(renderFn) {
  checkRendering(renderFn, usage);

  return ({attributeName}) => {
    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return {facets: [attributeName]};
      },

      _generateRanges(results) {
        const stats = results.getFacetStats(attributeName);
        return generateRanges(stats);
      },

      _extractRefinedRange(helper) {
        const refinements = helper.getRefinements(attributeName);
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

      _refine(helper, from, to) {
        const facetValues = this._extractRefinedRange(helper);

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

      init({helper, instantSearchInstance}) {
        this._instantSearchInstance = instantSearchInstance;
        this._refine = this._refine.bind(this, helper);

        renderFn({
          instantSearchInstance,
          facetValues: [],
          refine: this._refine,
        }, true);
      },

      render({results, helper, state, createURL}) {
        let facetValues;

        if (results && results.hits && results.hits.length > 0) {
          facetValues = this._extractRefinedRange(helper);

          if (facetValues.length === 0) {
            facetValues = this._generateRanges(results);
          }
        } else {
          facetValues = [];
        }

        facetValues.map(facetValue => {
          let newState = state.clearRefinements(attributeName);
          if (!facetValue.isRefined) {
            if (facetValue.from !== undefined) {
              newState = newState.addNumericRefinement(attributeName, '>=', Math.floor(facetValue.from));
            }
            if (facetValue.to !== undefined) {
              newState = newState.addNumericRefinement(attributeName, '<=', Math.ceil(facetValue.to));
            }
          }
          facetValue.url = createURL(newState);
          return facetValue;
        });

        renderFn({
          facetValues,
          refine: this._refine,
          instantSearchInstance: this._instantSearchInstance,
        }, false);
      },
    };
  };
}
