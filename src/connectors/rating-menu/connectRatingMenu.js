import {
  checkRendering,
  createDocumentationMessageGenerator,
  range,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'rating-menu',
  connector: true,
});

/**
 * @typedef {Object} StarRatingItems
 * @property {string} name Name corresponding to the number of stars.
 * @property {string} value Number of stars as string.
 * @property {number} count Count of matched results corresponding to the number of stars.
 * @property {boolean[]} stars Array of length of maximum rating value with stars to display or not.
 * @property {boolean} isRefined Indicates if star rating refinement is applied.
 */

/**
 * @typedef {Object} CustomStarRatingWidgetOptions
 * @property {string} attribute Name of the attribute for faceting (eg. "free_shipping").
 * @property {number} [max = 5] The maximum rating value.
 */

/**
 * @typedef {Object} StarRatingRenderingOptions
 * @property {StarRatingItems[]} items Possible star ratings the user can apply.
 * @property {function(string): string} createURL Creates an URL for the next
 * state (takes the item value as parameter). Takes the value of an item as parameter.
 * @property {function(string)} refine Selects a rating to filter the results
 * (takes the filter value as parameter). Takes the value of an item as parameter.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {Object} widgetParams All original `CustomStarRatingWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **StarRating** connector provides the logic to build a custom widget that will let
 * the user refine search results based on ratings.
 *
 * The connector provides to the rendering: `refine()` to select a value and
 * `items` that are the values that can be selected. `refine` should be used
 * with `items.value`.
 * @type {Connector}
 * @param {function(StarRatingRenderingOptions, boolean)} renderFn Rendering function for the custom **StarRating** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomStarRatingWidgetOptions)} Re-usable widget factory for a custom **StarRating** widget.
 * @example
 * // custom `renderFn` to render the custom StarRating widget
 * function renderFn(StarRatingRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     StarRatingRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   StarRatingRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() { $(this).off('click'); });
 *
 *   var listHTML = StarRatingRenderingOptions.items.map(function(item) {
 *     return '<li data-refine-value="' + item.value + '">' +
 *       '<a href="' + StarRatingRenderingOptions.createURL(item.value) + '">' +
 *       item.stars.map(function(star) { return star === false ? '☆' : '★'; }).join(' ') +
 *       '& up (' + item.count + ')' +
 *       '</a></li>';
 *   });
 *
 *   StarRatingRenderingOptions.widgetParams.containerNode
 *     .find('ul')
 *     .html(listHTML);
 *
 *   StarRatingRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *         event.stopPropagation();
 *
 *         StarRatingRenderingOptions.refine($(this).data('refine-value'));
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to StarRating logic
 * var customStarRating = instantsearch.connectors.connectRatingMenu(renderFn);
 *
 * // mount widget on the page
 * search.addWidgets([
 *   customStarRating({
 *     containerNode: $('#custom-rating-menu-container'),
 *     attribute: 'rating',
 *     max: 5,
 *   })
 * ]);
 */
export default function connectRatingMenu(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { attribute, max = 5 } = widgetParams;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    return {
      $$type: 'ais.ratingMenu',

      init({ helper, createURL, instantSearchInstance }) {
        this._toggleRefinement = this._toggleRefinement.bind(this, helper);
        this._createURL = state => facetValue =>
          createURL(state.toggleRefinement(attribute, facetValue));

        renderFn(
          {
            instantSearchInstance,
            items: [],
            hasNoResults: true,
            refine: this._toggleRefinement,
            createURL: this._createURL(helper.state),
            widgetParams,
          },
          true
        );
      },

      render({ helper, results, state, instantSearchInstance }) {
        const facetValues = [];
        const allValues = {};
        for (let v = max; v >= 0; --v) {
          allValues[v] = 0;
        }
        (results.getFacetValues(attribute) || []).forEach(facet => {
          const val = Math.round(facet.name);
          if (!val || val > max) {
            return;
          }
          for (let v = val; v >= 1; --v) {
            allValues[v] += facet.count;
          }
        });
        const refinedStar = this._getRefinedStar(helper.state);
        for (let star = max - 1; star >= 1; --star) {
          const count = allValues[star];
          if (refinedStar && star !== refinedStar && count === 0) {
            // skip count==0 when at least 1 refinement is enabled
            // eslint-disable-next-line no-continue
            continue;
          }
          const stars = [];
          for (let i = 1; i <= max; ++i) {
            stars.push(i <= star);
          }
          facetValues.push({
            stars,
            name: String(star),
            value: String(star),
            count,
            isRefined: refinedStar === star,
          });
        }

        renderFn(
          {
            instantSearchInstance,
            items: facetValues,
            hasNoResults: results.nbHits === 0,
            refine: this._toggleRefinement,
            createURL: this._createURL(state),
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.removeDisjunctiveFacet(attribute);
      },

      getWidgetState(uiState, { searchParameters }) {
        const value = this._getRefinedStar(searchParameters);

        if (typeof value !== 'number') {
          return uiState;
        }

        return {
          ...uiState,
          ratingMenu: {
            ...uiState.ratingMenu,
            [attribute]: value,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value = uiState.ratingMenu && uiState.ratingMenu[attribute];

        const withoutRefinements = searchParameters.clearRefinements(attribute);
        const withDisjunctiveFacet = withoutRefinements.addDisjunctiveFacet(
          attribute
        );

        if (!value) {
          return withDisjunctiveFacet.setQueryParameters({
            disjunctiveFacetsRefinements: {
              ...withDisjunctiveFacet.disjunctiveFacetsRefinements,
              [attribute]: [],
            },
          });
        }

        return range({ start: Number(value), end: max + 1 }).reduce(
          (parameters, number) =>
            parameters.addDisjunctiveFacetRefinement(attribute, number),
          withDisjunctiveFacet
        );
      },

      _toggleRefinement(helper, facetValue) {
        const isRefined =
          this._getRefinedStar(helper.state) === Number(facetValue);
        helper.removeDisjunctiveFacetRefinement(attribute);
        if (!isRefined) {
          for (let val = Number(facetValue); val <= max; ++val) {
            helper.addDisjunctiveFacetRefinement(attribute, val);
          }
        }
        helper.search();
      },

      _getRefinedStar(state) {
        const refinements = state.getDisjunctiveRefinements(attribute);

        if (!refinements.length) {
          return undefined;
        }

        return Math.min(...refinements.map(Number));
      },
    };
  };
}
