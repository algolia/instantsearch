import {PropTypes} from 'react';
import union from 'lodash/array/union';

import createHOC from '../createHOC';

function getKey(operator = 'or') {
  return operator === 'and' ? 'facets' : 'disjunctiveFacets';
}

export default createHOC({
  displayName: 'AlgoliaFacetRefiner',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    operator: PropTypes.oneOf(['and', 'or']),
    sortBy: PropTypes.arrayOf(PropTypes.string),
    showMore: PropTypes.bool,
    limitMax: PropTypes.number,
    limitMin: PropTypes.number,
  },

  defaultProps: {
    operator: 'or',
    sortBy: ['isRefined'],
    showMore: false,
    limitMax: 20,
    limitMin: 10,
  },

  configure(state, props) {
    const key = getKey(props.operator);
    const valuesPerFacet = props.showMore ? props.limitMax : props.limitMin;
    return state.setQueryParameters({
      [key]: union(state[key], [props.attributeName]),
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, valuesPerFacet),
    });
  },

  mapStateToProps(state, props) {
    const {
      searchResults,
      searchParameters,
      searchResultsSearchParameters,
    } = state;
    const {operator = 'or', attributeName} = props;

    let isFacetPresent = false;
    if (searchResults) {
      const wasRequested =
        searchResultsSearchParameters[getKey(operator)]
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
    if (
      operator === 'or' && searchParameters.isDisjunctiveFacet(attributeName) ||
      searchParameters.isConjunctiveFacet(attributeName)
    ) {
      if (operator === 'or') {
        selectedItems = searchParameters.getDisjunctiveRefinements(attributeName);
      } else {
        selectedItems = searchParameters.getConjunctiveRefinements(attributeName);
      }
    }

    return {
      facetValues: isFacetPresent ?
        state.searchResults.getFacetValues(attributeName, {
          sortBy: props.sortBy,
        }) :
        null,
      selectedItems,
    };
  },

  transformProps(props) {
    const {facetValues, ...otherProps} = props;
    if (!facetValues) {
      return otherProps;
    }
    const valuesPerFacet = props.showMore ? props.limitMax : props.limitMin;
    const facetVals = facetValues.slice(0, valuesPerFacet);
    return {
      ...otherProps,
      items: facetVals.map(v => ({
        value: v.name,
        count: v.count,
      })),
    };
  },

  refine(state, props, values) {
    const {
      facetValues,
      operator,
      attributeName,
    } = props;
    const key = getKey(operator);

    if (state[key].indexOf(attributeName) === -1) {
      // While the facet will already be present in the search results thanks to
      // the configManager, refining it should persist it in the helper's state.
      // @TODO: Or should it? We could also temporarily set it so that the
      // helper doesn't complain, but it should theoretically always be present
      // in the final configured state.
      state = state.setQueryParameters({
        [key]: union(state[key], [attributeName]),
      });
    }

    state = facetValues.reduce((s, val) => {
      if (values.indexOf(val.name) !== -1) {
        if (operator === 'and') {
          return s.addFacetRefinement(attributeName, val.name);
        }
        return s.addDisjunctiveFacetRefinement(attributeName, val.name);
      }
      if (operator === 'and') {
        return s.removeFacetRefinement(attributeName, val.name);
      }
      return s.removeDisjunctiveFacetRefinement(attributeName, val.name);
    }, state);

    return state;
  },
});
