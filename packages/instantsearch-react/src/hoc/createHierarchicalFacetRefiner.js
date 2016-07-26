import {PropTypes} from 'react';
import union from 'lodash/array/union';

import createHOC from '../createHOC';

function transformValue(value, limit) {
  return value.slice(0, limit).map(v => ({
    label: v.name,
    value: v.path,
    count: v.count,
    children: v.data && transformValue(v.data, limit),
  }));
}

export default createHOC({
  displayName: 'AlgoliaHierarchicalFacetRefiner',

  propTypes: {
    name: PropTypes.string.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    limit: PropTypes.number,
  },

  defaultProps: {
    sortBy: ['isRefined'],
    limit: 10,
  },

  configure(state, props) {
    return state.setQueryParameters({
      hierarchicalFacets: union(state.hierarchicalFacets, [{
        name: props.name,
        attributes: props.attributes,
      }]),
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, props.limit),
    });
  },

  mapStateToProps(state, props) {
    const {
      searchResults,
      searchParameters,
      searchResultsSearchParameters,
    } = state;
    const {name} = props;

    let isFacetPresent = false;
    if (searchResults) {
      const wasRequested =
        searchResultsSearchParameters.hierarchicalFacets
          .some(f => f.name === name);
      const wasReceived =
        Boolean(searchResults.getFacetByName(name));
      if (searchResults.nbHits > 0 && wasRequested && !wasReceived) {
        // eslint-disable-next-line no-console
        console.warn(
          `A component requested values for facet "${name}", ` +
          'but no facet values were retrieved from the API. This means that ' +
          `you should add the attribute "${name}" to the list ` +
          'of attributes for faceting in your index settings.'
        );
      }
      isFacetPresent = wasReceived;
    }

    let selectedItems = [];
    if (searchParameters.isHierarchicalFacet(name)) {
      selectedItems = searchParameters.getHierarchicalRefinement(name);
    }
    return {
      facetValue: isFacetPresent ?
        state.searchResults.getFacetValues(name, {
          sortBy: props.sortBy,
        }) :
        null,
      selectedItems,
    };
  },

  transformProps(props) {
    const {facetValue, ...otherProps} = props;
    if (!facetValue) {
      return otherProps;
    }

    return {
      ...otherProps,
      items: transformValue(facetValue.data, props.limit),
    };
  },

  refine(state, props, value) {
    const {name, attributes} = props;

    if (!state.isHierarchicalFacet(name)) {
      state = state.setQueryParameters({
        hierarchicalFacets: state.hierarchicalFacets.concat([{
          name,
          attributes,
        }]),
      });
    }

    state = state.toggleHierarchicalFacetRefinement(name, value);
    return state;
  },
});
