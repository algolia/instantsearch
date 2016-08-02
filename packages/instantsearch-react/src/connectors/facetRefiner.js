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
  mapStateToProps(state, props) {
    const {
      searchResults,
      searchParameters,
      searchResultsSearchParameters,
    } = state;
    const {facetType, attributeName, sortBy} = props;

    let isFacetPresent = false;
    if (searchResults) {
      const wasRequested =
        searchResultsSearchParameters[facetTypeToKey[facetType]]
          .indexOf(attributeName) !== -1;
      const wasReceived =
        Boolean(searchResults.getFacetByName(attributeName));
      if (searchResults.nbHits > 0 && wasRequested && !wasReceived) {
        // eslint-disable-next-line no-console
        console.warn(
          `A component requested values for facet "${attributeName}", ` +
          'but no facet values were retrieved from the API. This means that ' +
          `you should add the attribute "${attributeName}" to the list ` +
          'of attributes for faceting in your index settings.'
        );
      }
      isFacetPresent = wasReceived;
    }

    let selectedItems = [];
    if (isFacetType(searchParameters, facetType, attributeName)) {
      selectedItems = getRefinements(
        searchParameters,
        facetType,
        attributeName
      );
    }

    return {
      facetValues: isFacetPresent ?
        state.searchResults.getFacetValues(attributeName, {sortBy}) :
        null,
      selectedItems,
    };
  },

  configure(state, props) {
    const {facetType, attributeName, limit} = props;
    const facetKey = facetTypeToKey[facetType];
    return state.setQueryParameters({
      [facetKey]: union(state[facetKey], [attributeName]),
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, limit),
    });
  },

  transformProps(props) {
    const {facetValues, selectedItems, limit} = props;
    if (!facetValues) {
      return {selectedItems};
    }
    const facetVals = facetValues.slice(0, limit);
    return {
      selectedItems,
      items: facetVals.map(v => ({
        value: v.name,
        count: v.count,
      })),
    };
  },

  refine(state, props, values) {
    const {facetType, attributeName} = props;

    if (!isFacetType(state, facetType, attributeName)) {
      // While the facet will already be present in the search results thanks to
      // the configManager, refining it will persist it in the helper's state.
      // Note that facets list do not appear in the URL by default, but depend
      // on the state filter that is applied by `stateToQueryString` (see
      // createStageManager.js).
      const key = facetTypeToKey[facetType];
      state = state.setQueryParameters({
        [key]: union(state[key], [attributeName]),
      });
    }

    state = state.clearRefinements(attributeName);
    state = values.reduce((s, val) =>
      s.toggleRefinement(attributeName, val)
    , state);

    return state;
  },
};
