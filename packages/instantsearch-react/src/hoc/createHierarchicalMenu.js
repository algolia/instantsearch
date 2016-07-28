import {PropTypes} from 'react';

import createHOC from '../createHOC';
import facetRefiner from './facetRefiner';

function transformValue(value, limit) {
  return value.slice(0, limit).map(v => ({
    label: v.name,
    value: v.path,
    count: v.count,
    children: v.data && transformValue(v.data, limit),
  }));
}

const maybeAddHierarchicalFacet = (state, props) => {
  if (state.isHierarchicalFacet(props.name)) {
    return state;
  }
  return state.setQueryParameters({
    hierarchicalFacets: state.hierarchicalFacets.concat([{
      name: props.name,
      attributes: props.attributes,
      separator: props.separator,
      rootPath: props.rootPath,
      showParentLevel: props.showParentLevel,
    }]),
  });
};

export default createHOC({
  displayName: 'AlgoliaHierarchicalMenu',

  propTypes: {
    name: PropTypes.string.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
    separator: PropTypes.string,
    rootPath: PropTypes.string,
    showParentLevel: PropTypes.bool,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    limit: PropTypes.number,
  },

  defaultProps: {
    sortBy: ['name:asc'],
    separator: ' > ',
    rootPath: null,
    showParentLevel: true,
    limit: 10,
  },

  configure(state, props) {
    return maybeAddHierarchicalFacet(state, props).setQueryParameters({
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, props.limit),
    });
  },

  mapStateToProps(state, props) {
    const {
      searchResults,
      searchParameters,
      searchResultsSearchParameters,
    } = state;
    const {name, attributes, sortBy} = props;

    // @TODO: warn when one of the requested facets isn't set as an
    // attribute for faceting.
    let selectedItems = [];
    if (searchParameters.isHierarchicalFacet(name)) {
      selectedItems = searchParameters.getHierarchicalRefinement(name);
    }

    return {
      facetValue:
        state.searchResults &&
        state.searchResults.getFacetValues(name, {sortBy}),
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
      items: facetValue.data ?
        transformValue(facetValue.data, props.limit) :
        // In the case the hierachical facet value has no items
        [],
    };
  },

  refine(state, props, value) {
    const {name} = props;

    state = maybeAddHierarchicalFacet(state, props);
    state = state.toggleHierarchicalFacetRefinement(name, value);

    return state;
  },
});
