import union from 'lodash/array/union';

const facetTypeToKey = {
  conjunctive: 'facets',
  disjunctive: 'disjunctiveFacets',
};

const isFacetType = (state, type, name) => {
  switch (type) {
  case 'conjunctive':
    return state.isConjunctiveFacet(name);
  case 'disjunctive':
    return state.isDisjunctiveFacet(name);
  default:
    throw new Error(`Unknown facet type: ${type}`);
  }
};

const getRefinements = (state, type, name) => {
  switch (type) {
  case 'conjunctive':
    return state.getConjunctiveRefinements(name);
  case 'disjunctive':
    return state.getDisjunctiveRefinements(name);
  default:
    throw new Error(`Unknown facet type: ${type}`);
  }
};

export default {
  configure: (state, opts) => {
    const {facetType, facetName, valuesPerFacet} = opts;
    const facetKey = facetTypeToKey[facetType];
    return state.setQueryParameters({
      [facetKey]: union(state[facetKey], [facetName]),
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, valuesPerFacet),
    });
  },

  mapStateToProps(state, opts) {
    const {
      searchResults,
      searchParameters,
      searchResultsSearchParameters,
    } = state;
    const {facetType, facetName, sortBy} = opts;

    let isFacetPresent = false;
    if (searchResults) {
      const wasRequested =
        searchResultsSearchParameters[facetTypeToKey[facetType]]
          .indexOf(facetName) !== -1;
      const wasReceived =
        Boolean(searchResults.getFacetByName(facetName));
      if (searchResults.nbHits > 0 && wasRequested && !wasReceived) {
        // eslint-disable-next-line no-console
        console.warn(
          `A component requested values for facet "${facetName}", ` +
          'but no facet values were retrieved from the API. This means that ' +
          `you should add the attribute "${facetName}" to the list ` +
          'of attributes for faceting in your index settings.'
        );
      }
      isFacetPresent = wasReceived;
    }

    let selectedItems = [];
    if (isFacetType(searchParameters, facetType, facetName)) {
      selectedItems = getRefinements(searchParameters, facetType, facetName);
    }

    return {
      facetValues: isFacetPresent ?
        state.searchResults.getFacetValues(facetName, {sortBy}) :
        null,
      selectedItems,
    };
  },

  transformProps(props, opts) {
    const {facetValues, ...otherProps} = props;
    const {valuesPerFacet} = opts;
    if (!facetValues) {
      return otherProps;
    }
    const facetVals = facetValues.slice(0, valuesPerFacet);
    return {
      ...otherProps,
      items: facetVals.map(v => ({
        value: v.name,
        count: v.count,
      })),
    };
  },

  refine(state, opts, values) {
    const {facetType, facetName} = opts;

    if (!isFacetType(state, facetType, facetName)) {
      // While the facet will already be present in the search results thanks to
      // the configManager, refining it will persist it in the helper's state.
      // Note that facets list do not appear in the URL by default, but depend
      // on the state filter that is applied by `stateToQueryString` (see
      // createStageManager.js).
      const key = facetTypeToKey[facetType];
      state = state.setQueryParameters({
        [key]: union(state[key], [facetName]),
      });
    }

    state = state.clearRefinements(facetName);
    state = values.reduce((s, val) =>
      s.toggleRefinement(facetName, val)
    , state);

    return state;
  },
};
