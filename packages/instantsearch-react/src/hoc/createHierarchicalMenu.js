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

const FACET_TYPE = 'hierarchical';

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
    return facetRefiner.mapStateToProps(state, {
      facetType: FACET_TYPE,
      facetName: props.name,
      sortBy: props.sortBy,
    });
  },

  transformProps(props) {
    const {facetValues, ...otherProps} = props;
    if (!facetValues) {
      return otherProps;
    }

    return {
      ...otherProps,
      items: facetValues.data ?
        transformValue(facetValues.data, props.limit) :
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
