import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

function getSelectedItem(props, state) {
  const id = props.id;
  if (typeof state[id] !== 'undefined') {
    if (state[id] === '') {
      return null;
    }
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
    id: PropTypes.string.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
    separator: PropTypes.string,
    rootPath: PropTypes.string,
    showParentLevel: PropTypes.bool,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    defaultSelectedItem: PropTypes.string,
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
    const {id, sortBy, showMore, limitMin, limitMax} = props;
    const {results} = search;

    const isFacetPresent =
      Boolean(results) &&
      Boolean(results.getFacetByName(id));

    if (!isFacetPresent) {
      return null;
    }

    const limit = showMore ? limitMax : limitMin;
    const value = results.getFacetValues(id, {sortBy});
    return {
      items: value.data ? transformValue(value.data, limit) : [],
      selectedItem: getSelectedItem(props, state),
    };
  },

  refine(props, state, nextSelectedItem) {
    return {
      ...state,
      [props.id]: nextSelectedItem || '',
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {
      id,
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
        name: id,
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
        id,
        selectedItem
      );
    }

    return searchParameters;
  },

  getMetadata(props, state) {
    const {id} = props;
    const selectedItem = getSelectedItem(props, state);
    return {
      id,
      filters: !selectedItem ? [] : [{
        key: `${id}.${selectedItem}`,
        label: `${id}: ${selectedItem}`,
        clear: nextState => ({
          ...nextState,
          [id]: '',
        }),
      }],
    };
  },
});
