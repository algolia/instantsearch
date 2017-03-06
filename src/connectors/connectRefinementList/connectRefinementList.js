export default function connectRefinementList(refinementListRendering) {
  return ({
      attributeName,
      operator = 'or',
      limit,
      sortBy = ['count:desc', 'name:asc'],
    }) => {
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

      refinementListRendering({
        createURL: _createURL,
        items,
        refine,
        searchForFacetValues: searchFacetValues,
        instantSearchInstance,
        isFromSearch,
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
      getConfiguration: configuration => {
        const widgetConfiguration = {
          [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [attributeName],
        };

        const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit);

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

        render(facetValues, state, createURL, searchForFacetValues,
               this._templateProps, refine, false, false);
      },
    };
  };
}
