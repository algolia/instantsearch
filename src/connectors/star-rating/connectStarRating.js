import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customStarRating = connectStarRating(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   createURL,
  //   refine,
  //   instantSearchInstance,
  //   hasNoResults,
  // }
});
search.addWidget(
  customStarRatingI({
    attributeName,
    [ max=5 ],
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectStarRating.html
`;

/**
 * @typedef {Object} CustomStarRatingWidgetOptions
 * @param {string} attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param {number} [max = 5] the maximum rating value
 */

/**
 * @typedef {Object} StarRatingRenderingOptions
 * @property {Object[]} items all the elements to render
 * @property {function} createURL a function that creates a url for the next state (takes the filter value as parameter)
 * @property {function} refine a function that switch to the next state and do a search (takes the filter value as parameter)
 * @property {boolean} hasNoResults a boolean that indicates that the last search contains no results
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * Connects a rendering function with the star rating business logic.
 * @param {function(StarRatingRenderingOptions, boolean)} renderFn function that renders the star rating widget
 * @return {function(CustomStarRatingWidgetOptions)} a widget factory for star rating widget
 */
export default function connectStarRating(renderFn) {
  checkRendering(renderFn, usage);

  return widgetParams => {
    const {
      attributeName,
      max = 5,
    } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return {disjunctiveFacets: [attributeName]};
      },

      init({helper, createURL, instantSearchInstance}) {
        this._toggleRefinement = this._toggleRefinement.bind(this, helper);
        this._createURL = state => facetValue => createURL(state.toggleRefinement(attributeName, facetValue));

        renderFn({
          instantSearchInstance,
          items: [],
          hasNoResults: true,
          refine: this._toggleRefinement,
          createURL: this._createURL(helper.state),
          widgetParams,
        }, true);
      },

      render({helper, results, state, instantSearchInstance}) {
        const facetValues = [];
        const allValues = {};
        for (let v = max; v >= 0; --v) {
          allValues[v] = 0;
        }
        results.getFacetValues(attributeName).forEach(facet => {
          const val = Math.round(facet.name);
          if (!val || val > max) {
            return;
          }
          for (let v = val; v >= 1; --v) {
            allValues[v] += facet.count;
          }
        });
        const refinedStar = this._getRefinedStar(helper);
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
            count,
            isRefined: refinedStar === star,
          });
        }

        renderFn({
          instantSearchInstance,
          items: facetValues,
          hasNoResults: results.nbHits === 0,
          refine: this._toggleRefinement,
          createURL: this._createURL(state),
          widgetParams,
        }, false);
      },

      _toggleRefinement(helper, facetValue) {
        const isRefined = this._getRefinedStar(helper) === Number(facetValue);
        helper.clearRefinements(attributeName);
        if (!isRefined) {
          for (let val = Number(facetValue); val <= max; ++val) {
            helper.addDisjunctiveFacetRefinement(attributeName, val);
          }
        }
        helper.search();
      },

      _getRefinedStar(helper) {
        let refinedStar = undefined;
        const refinements = helper.getRefinements(attributeName);
        refinements.forEach(r => {
          if (!refinedStar || Number(r.value) < refinedStar) {
            refinedStar = Number(r.value);
          }
        });
        return refinedStar;
      },
    };
  };
}
