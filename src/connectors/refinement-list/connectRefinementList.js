import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customRefinementList = connectRefinementList(function render(params) {
  // params = {
  //   isFirstRender,
  //   isFromSearch,
  //   createURL,
  //   items,
  //   refine,
  //   searchForItems,
  //   instantSearchInstance,
  //   canRefine,
  // }
});
search.addWidget(
  customRefinementList({
    attributeName,
    [ operator = 'or' ],
    [ limit ],
    [ sortBy = ['count:desc', 'name:asc'] ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectRefinementList.html
`;

export const checkUsage = ({attributeName, operator, usageMessage}) => {
  const noAttributeName = attributeName === undefined;
  const invalidOperator = !(/^(and|or)$/).test(operator);

  if (noAttributeName || invalidOperator) {
    throw new Error(usageMessage);
  }
};

/**
 * refinementList connector, allows you to create your own refinement list and completely tune
 * the rendering of it.
 * @name connectRefinementList
 * @TODO: I do not know how to document the dual ()() call in an efficient way with jsDoc that will also be easy
 * to crawl with the doc crawler (maybe re-use exposed props and provided props but rename it for non react people?)
 * @param {function} renderFn The rendering function.
 * @providedProp isFirstRender
 * @providedProp isFromSearch
 * @providedProp createURL
 * @providedProp items
 * @providedProp refine
 * @providedProp searchForItems
 * @providedProp instantSearchInstance
 * @providedProp canRefine
 * @exposedProp attributeName
 * @exposedProp operator
 * @exposedProp limit
 * @exposedProp sortBy
 * @return {[type]}                         [description]
 */
export default function connectRefinementList(renderFn) {
  checkRendering(renderFn, usage);

  return ({
      attributeName,
      operator = 'or',
      limit,
      sortBy = ['count:desc', 'name:asc'],
    }) => {
    checkUsage({attributeName, operator, usage});

    /* eslint-disable max-params */
    const render = (items, state, createURL,
                    helperSpecializedSearchFacetValues,
                    refine, isFromSearch, isFirstSearch, instantSearchInstance) => {
      // Compute a specific createURL method able to link to any facet value state change
      const _createURL = facetValue => createURL(state.toggleRefinement(attributeName, facetValue));

      // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
      // function
      const searchFacetValues = helperSpecializedSearchFacetValues &&
        helperSpecializedSearchFacetValues(
          state,
          createURL,
          helperSpecializedSearchFacetValues,
          refine);

      renderFn({
        createURL: _createURL,
        items,
        refine,
        searchForItems: searchFacetValues,
        instantSearchInstance,
        isFromSearch,
        canRefine: isFromSearch || items.length > 0,
      }, isFirstSearch);
    };

    let lastResultsFromMainSearch;
    let searchForFacetValues;
    let refine;

    const createSearchForFacetValues = helper =>
      (state, createURL, helperSpecializedSearchFacetValues, toggleRefinement) =>
      query => {
        if (query === '' && lastResultsFromMainSearch) {
          // render with previous data from the helper.
          render(
            lastResultsFromMainSearch, state, createURL,
            helperSpecializedSearchFacetValues, toggleRefinement, false);
        } else {
          helper.searchForFacetValues(attributeName, query).then(results => {
            const facetValues = results.facetHits.map(h => {
              h.name = h.value;
              return h;
            });
            render(
              facetValues, state, createURL,
              helperSpecializedSearchFacetValues, toggleRefinement, true, false);
          });
        }
      };

    return {
      getConfiguration: (configuration = {}) => {
        const widgetConfiguration = {
          [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [attributeName],
        };

        if (limit !== undefined) {
          const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
          widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit);
        }

        return widgetConfiguration;
      },
      init({helper, createURL, instantSearchInstance}) {
        refine = facetValue => helper
          .toggleRefinement(attributeName, facetValue)
          .search();

        searchForFacetValues = createSearchForFacetValues(helper);

        render([], helper.state, createURL, searchForFacetValues, refine, false, true, instantSearchInstance);
      },
      render({results, state, createURL}) {
        const facetValues = results
          .getFacetValues(attributeName, {sortBy})
          .map(h => {
            h.highlighted = h.name;
            return h;
          });

        lastResultsFromMainSearch = facetValues;

        render(facetValues, state, createURL, searchForFacetValues, refine, false, false);
      },
    };
  };
}
