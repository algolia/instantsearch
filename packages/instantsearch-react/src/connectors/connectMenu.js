import {PropTypes} from 'react';

import createConnector from '../createConnector';

function getId(props) {
  return props.id || props.attributeName;
}

function getSelectedItem(props, state) {
  const id = getId(props);
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

export default createConnector({
  displayName: 'AlgoliaMenu',

  propTypes: {
    id: PropTypes.string,
    attributeName: PropTypes.string.isRequired,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    defaultSelectedItem: PropTypes.string,
  },

  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
    sortBy: ['count:desc', 'name:asc'],
  },

  getProps(props, state, search) {
    const {results} = search;
    const {attributeName, sortBy, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    const isFacetPresent =
      Boolean(results) &&
      Boolean(results.getFacetByName(attributeName));

    if (!isFacetPresent) {
      return null;
    }

    const items = results
      .getFacetValues(attributeName, {sortBy})
      .slice(0, limit)
      .map(v => ({
        value: v.name,
        count: v.count,
      }));

    return {items, selectedItem: getSelectedItem(props, state)};
  },

  refine(props, state, nextSelectedItem) {
    const id = getId(props);
    return {
      ...state,
      [id]: nextSelectedItem || '',
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {attributeName, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    searchParameters = searchParameters.setQueryParameters({
      maxValuesPerFacet: Math.max(state.maxValuesPerFacet || 0, limit),
    });

    searchParameters = searchParameters.addDisjunctiveFacet(attributeName);

    const selectedItem = getSelectedItem(props, state);
    if (selectedItem !== null) {
      searchParameters = searchParameters.addDisjunctiveFacetRefinement(
        attributeName,
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
        label: `${props.attributeName}: ${selectedItem}`,
        clear: nextState => ({
          ...nextState,
          [id]: '',
        }),
      }],
    };
  },
});
