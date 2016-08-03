import {PropTypes} from 'react';

import createConnector from '../createConnector';

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

export default createConnector({
  displayName: 'AlgoliaHierarchicalMenu',

  propTypes: {
    name: PropTypes.string.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
    separator: PropTypes.string,
    rootPath: PropTypes.string,
    showParentLevel: PropTypes.bool,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    limit: PropTypes.number.isRequired,
  },

  defaultProps: {
    sortBy: ['name:asc'],
    separator: ' > ',
    rootPath: null,
    showParentLevel: true,
  },

  mapStateToProps(state, props) {
    const {
      searchResults,
      searchParameters,
    } = state;
    const {name, sortBy} = props;

    // @TODO: warn when one of the requested facets isn't set as an
    // attribute for faceting.
    let selectedItems = [];
    if (searchParameters.isHierarchicalFacet(name)) {
      selectedItems = searchParameters.getHierarchicalRefinement(name);
    }

    return {
      facetValue: searchResults && searchResults.getFacetValues(name, {sortBy}),
      selectedItems,
    };
  },

  configure(state, props) {
    return maybeAddHierarchicalFacet(state, props).setQueryParameters({
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, props.limit),
    });
  },

  transformProps(props) {
    const {facetValue, selectedItems, limit} = props;
    if (!facetValue) {
      return {selectedItems};
    }

    return {
      selectedItems,
      items: facetValue.data ?
        transformValue(facetValue.data, limit) :
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
