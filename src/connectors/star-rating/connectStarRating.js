import {checkRendering} from '../../lib/utils.js';

/**
 * Instantiate a list of refinements based on a rating attribute
 * The ratings must be integer values. You can still keep the precise float value in another attribute
 * to be used in the custom ranking configuration. So that the actual hits ranking is precise.
 * @function starRating
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for filtering
 * @param  {number} [options.max] The maximum rating value
 * @param  {Object} [options.labels] Labels used by the default template
 * @param  {string} [options.labels.andUp] The label suffixed after each line
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.disabledLink] CSS class to add to each disabled link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.star] CSS class to add to each star element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.emptyStar] CSS class to add to each empty star element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
var customStarRating = connectStarRating(function render(params, isFirstRendering) {
  // params = {
  //   facetValues,
  //   createURL,
  //   instantSearchInstance,
  //   results,
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
export default function connectStarRating(renderFn) {
  checkRendering(renderFn, usage);

  return ({
    attributeName,
    max = 5,
  }) => {
    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return {disjunctiveFacets: [attributeName]};
      },

      init({helper, createURL, instantSearchInstance}) {
        this._instantSearchInstance = instantSearchInstance;
        this._toggleRefinement = this._toggleRefinement.bind(this, helper);
        this._createURL = state => facetValue => createURL(state.toggleRefinement(attributeName, facetValue));

        renderFn({
          instantSearchInstance: this._instantSearchInstance,
          facetValues: [],
          nbHits: 0,
          refine: this._toggleRefinement,
          createURL: this._createURL(helper.state),
        }, true);
      },

      render({helper, results, state}) {
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
          instantSearchInstance: this._instantSearchInstance,
          facetValues,
          nbHits: results.nbHits,
          refine: this._toggleRefinement,
          createURL: this._createURL(state),
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
