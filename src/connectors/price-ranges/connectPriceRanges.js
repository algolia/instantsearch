import { checkRendering } from '../../lib/utils.js';
import generateRanges from './generate-ranges.js';

const usage = `Usage:
var customPriceRanges = connectPriceRanges(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customPriceRanges({
    attributeName,
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectPriceRanges.html
`;

/**
 * @typedef {Object} PriceRangesItem
 * @property {number} [from] Lower bound of the price range.
 * @property {number} [to] Higher bound of the price range.
 * @property {string} url The URL for a single item in the price range.
 */

/**
 * @typedef {Object} CustomPriceRangesWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting.
 */

/**
 * @typedef {Object} PriceRangesRenderingOptions
 * @property {PriceRangesItem[]} items The prices ranges to display.
 * @property {function(PriceRangesItem)} refine Selects or unselects a price range and trigger a search.
 * @property {Object} widgetParams All original `CustomPriceRangesWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **PriceRanges** connector provides the logic to build a custom widget that will let
 * the user refine results based on price ranges.
 *
 * @type {Connector}
 * @param {function(PriceRangesRenderingOptions, boolean)} renderFn Rendering function for the custom **PriceRanges** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomPriceRangesWidgetOptions)} Re-usable widget factory for a custom **PriceRanges** widget.
 * @example
 * function getLabel(item) {
 *   var from = item.from;
 *   var to = item.to;
 *
 *   if (to === undefined) return '≥ $' + from;
 *   if (from === undefined) return '≤ $' + to;
 *   return '$' + from + ' - $' + to;
 * }
 *
 * // custom `renderFn` to render the custom PriceRanges widget
 * function renderFn(PriceRangesRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     PriceRangesRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   PriceRangesRenderingOptions.widgetParams.containerNode
 *     .find('ul > li')
 *     .each(function() { $(this).off('click'); });
 *
 *   var list = PriceRangesRenderingOptions.items.map(function(item) {
 *     return '<li><a href="' + item.url + '">' + getLabel(item) + '</a></li>';
 *   });
 *
 *   PriceRangesRenderingOptions.widgetParams.containerNode
 *     .find('ul')
 *     .html(list);
 *
 *   PriceRangesRenderingOptions.widgetParams.containerNode
 *     .find('li')
 *     .each(function(index) {
 *       $(this).on('click', function(event) {
 *         event.stopPropagation();
 *         event.preventDefault();
 *
 *         PriceRangesRenderingOptions.refine(
 *           PriceRangesRenderingOptions.items[index]
 *         );
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to PriceRanges logic
 * var customPriceRanges = instantsearch.connectors.connectPriceRanges(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customPriceRanges({
 *     containerNode: $('#custom-price-ranges-container'),
 *     attributeName: 'price',
 *   })
 * );
 */
export default function connectPriceRanges(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { attributeName } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return { facets: [attributeName] };
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
        return [{ from, to, isRefined: true }];
      },

      _refine(helper, { from, to }) {
        const facetValues = this._extractRefinedRange(helper);

        helper.clearRefinements(attributeName);
        if (
          facetValues.length === 0 ||
          facetValues[0].from !== from ||
          facetValues[0].to !== to
        ) {
          if (typeof from !== 'undefined') {
            helper.addNumericRefinement(attributeName, '>=', Math.floor(from));
          }
          if (typeof to !== 'undefined') {
            helper.addNumericRefinement(attributeName, '<=', Math.ceil(to));
          }
        }

        helper.search();
      },

      init({ helper, instantSearchInstance }) {
        this.refine = opts => {
          this._refine(helper, opts);
        };

        renderFn(
          {
            instantSearchInstance,
            items: [],
            refine: this.refine,
            widgetParams,
          },
          true
        );
      },

      render({ results, helper, state, createURL, instantSearchInstance }) {
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
              newState = newState.addNumericRefinement(
                attributeName,
                '>=',
                Math.floor(facetValue.from)
              );
            }
            if (facetValue.to !== undefined) {
              newState = newState.addNumericRefinement(
                attributeName,
                '<=',
                Math.ceil(facetValue.to)
              );
            }
          }
          facetValue.url = createURL(newState);
          return facetValue;
        });

        renderFn(
          {
            items: facetValues,
            refine: this.refine,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        const nextState = state
          .removeFacetRefinement(attributeName)
          .removeFacet(attributeName);

        return nextState;
      },

      getWidgetState(fullState, { state }) {
        const { '>=': min = '', '<=': max = '' } = state.getNumericRefinements(
          attributeName
        );

        if (
          (min === '' && max === '') ||
          (fullState &&
            fullState.priceRanges &&
            fullState.priceRanges[attributeName] === `${min}:${max}`)
        ) {
          return fullState;
        }

        return {
          ...fullState,
          priceRanges: {
            ...fullState.priceRanges,
            [attributeName]: `${min}:${max}`,
          },
        };
      },

      getWidgetSearchParameters(searchParam, { uiState }) {
        const value =
          uiState && uiState.priceRanges && uiState.priceRanges[attributeName];

        if (value && value.indexOf(':') >= 0) {
          const clearedParams = searchParam.clearRefinements(attributeName);
          const [lowerBound, upperBound] = value.split(':');
          if (
            (lowerBound || lowerBound === 0) &&
            (upperBound || upperBound === 0)
          ) {
            return clearedParams
              .addNumericRefinement(attributeName, '>=', lowerBound)
              .addNumericRefinement(attributeName, '<=', upperBound);
          }
          if (lowerBound || lowerBound === 0)
            return clearedParams.addNumericRefinement(
              attributeName,
              '>=',
              lowerBound
            );
          if (upperBound || upperBound === 0)
            return clearedParams.addNumericRefinement(
              attributeName,
              '<=',
              upperBound
            );
        }
        return searchParam;
      },
    };
  };
}
