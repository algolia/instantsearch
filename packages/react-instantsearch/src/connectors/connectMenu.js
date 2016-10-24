import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

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
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return null;
}

export default createConnector({
  displayName: 'AlgoliaMenu',

  propTypes: {
    /**
     * URL State serialization key. Defaults to `attributeName`.
     * @public
     */
    id: PropTypes.string,

    /**
     * Name of the attribute for faceting
     * @public
     */
    attributeName: PropTypes.string.isRequired,

    /**
     * Display a show more button for increasing the number of refinement values from `limitMin` to `limitMax`.
     * @public
     */
    showMore: PropTypes.bool,

    /**
     * Minimum number of refinement values.
     * @public
     */
    limitMin: PropTypes.number,

    /**
     * Maximum number of refinement values. Ignored when `showMore` is `false`.
     * @public
     */
    limitMax: PropTypes.number,

    /**
     * How to sort refinement values. See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values) for the full list of options.
     * @public
     */
    sortBy: PropTypes.arrayOf(PropTypes.string),

    /**
     * The default state of this widget.
     * @public
     */
    defaultRefinement: PropTypes.string,
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

    return {items, currentRefinement: getSelectedItem(props, state)};
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
      maxValuesPerFacet: Math.max(
        searchParameters.maxValuesPerFacet || 0,
        limit
      ),
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
        label: `${props.attributeName}: ${selectedItem}`,
        clear: nextState => ({
          ...nextState,
          [id]: '',
        }),
      }],
    };
  },
});
