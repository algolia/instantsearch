import {PropTypes} from 'react';

import createConnector from '../createConnector';

function getId(props) {
  return props.id || props.name;
}

function getSelectedItem(props, state) {
  const id = getId(props);
  if (typeof state[id] !== 'undefined') {
    return state[id];
  }
  if (props.defaultSelectedItem) {
    return props.defaultSelectedItem;
  }
  return null;
}

function transformValue(value, limit) {
  return value.slice(0, limit).map(v => ({
    label: v.name,
    value: v.path,
    count: v.count,
    children: v.data && transformValue(v.data, limit),
  }));
}

export default createConnector({
  displayName: 'AlgoliaHierarchicalMenu',

  propTypes: {
    name: PropTypes.string.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
    separator: PropTypes.string,
    rootPath: PropTypes.string,
    showParentLevel: PropTypes.bool,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  },

  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
    sortBy: ['name:asc'],
    separator: ' > ',
    rootPath: null,
    showParentLevel: true,
  },

  getProps(props, state, search) {
    if (!search.results) {
      return null;
    }
    const {name, sortBy, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;
    const value = search.results.getFacetValues(name, {sortBy});
    return {
      items: value.data ? transformValue(value.data, limit) : [],
      selectedItem: getSelectedItem(props, state),
    };
  },

  refine(props, state, nextSelectedItem) {
    const id = getId(props);
    return {
      ...state,
      [id]: nextSelectedItem,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {
      name,
      attributes,
      separator,
      rootPath,
      showParentLevel,
      showMore,
      limitMin,
      limitMax,
    } = props;
    const limit = showMore ? limitMax : limitMin;

    searchParameters = searchParameters
      .addHierarchicalFacet({
        name,
        attributes,
        separator,
        rootPath,
        showParentLevel,
      })
      .setQueryParameters({
        maxValuesPerFacet: Math.max(
          searchParameters.maxValuesPerFacet || 0,
          limit
        ),
      });

    const selectedItem = getSelectedItem(props, state);
    if (selectedItem !== null) {
      searchParameters = searchParameters.toggleHierarchicalFacetRefinement(
        props.name,
        selectedItem
      );
    }

    return searchParameters;
  },

  getMetadata(props, state) {
    const id = getId(props);
    const selectedItem = getSelectedItem(props, state);
    return {
      id,
      filters: selectedItem === null ? [] : [{
        key: `${id}.${selectedItem}`,
        label: `${props.name}: ${selectedItem}`,
        clear: nextState => ({
          ...nextState,
          [id]: null,
        }),
      }],
    };
  },
});
