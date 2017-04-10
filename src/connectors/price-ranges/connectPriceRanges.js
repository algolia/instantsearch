import {checkRendering} from '../../lib/utils.js';
import generateRanges from './generate-ranges.js';

const usage = `Usage:
var customPriceRanges = connectToggle(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  //   currentRefinement,
  // }
});
search.addWidget(
  customPriceRanges({
    attributeName,
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectPriceRanges.html
`;

/**
 * @typedef {Object} CustomPriceRangesWidgetOptions
 * @param {string} attributeName Name of the attribute for faceting
 */

/**
 * @typedef {Object} PriceRangesRenderingOptions
 * @property {Object[]} items the prices ranges to display
 * @property {function({from: ?number, to: ?number})} refine select or unselect a price range and trigger a search
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} currentRefinement the refinement currently applied
 */

 /**
  * Connects a rendering function with the price ranges business logic.
  * @param {function(PriceRangesRenderingOptions, boolean)} renderFn function that renders the price ranges widget
  * @return {function(CustomPriceRangesWidgetOptions)} a widget factory for price ranges widget
  */
export default function connectPriceRanges(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {attributeName} = widgetParams;

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

      _refine(helper, {from, to}) {
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
        this._refine = this._refine.bind(this, helper);

        renderFn({
          instantSearchInstance,
          items: [],
          refine: this._refine,
          widgetParams,
          currentRefinement: null,
        }, true);
      },

      render({results, helper, state, createURL, instantSearchInstance}) {
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
          items: facetValues,
          refine: this._refine,
          widgetParams,
          instantSearchInstance,
          currentRefinement: facetValues.find(({isRefined}) => isRefined),
        }, false);
      },
    };
  };
}
