import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

function getId(props) {
  return props.id || props.attributeName;
}

function getSelectedItems(props, state) {
  const id = getId(props);
  if (typeof state[id] !== 'undefined') {
    if (typeof state[id] === 'string') {
      // This is the case where we've deselected all items.
      return [];
    }
    return state[id];
  }
  if (props.defaultSelectedItems) {
    return props.defaultSelectedItems;
  }
  return [];
}

export default createConnector({
  displayName: 'AlgoliaRefinementList',

  propTypes: {
    /**
     * URL state serialization key. Defaults to the value of `attributeName`.
     * The state of this widget takes the form of a list of `string`s, which
     * correspond to the values of all selected refinements.
     * However, when there are no refinements selected, the value of the state
     * is an empty string.
     * @public
     */
    id: PropTypes.string,

    /**
     * Name of the attribute for faceting
     * @public
     */
    attributeName: PropTypes.string.isRequired,

    /**
     * How to apply the refinements.
     * @public
     */
    operator: PropTypes.oneOf(['and', 'or']),

    /**
     * Display a show more button for increasing the number of refinement values
     * from `limitMin` to `limitMax`.
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
     * How to sort refinement values.
     * See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values)
     * for the full list of options.
     * @public
     */
    sortBy: PropTypes.arrayOf(PropTypes.string),

    /**
     * The default state of this widget, as an array of facet values.
     * @public
     */
    defaultSelectedItems: PropTypes.arrayOf(PropTypes.string),
  },

  defaultProps: {
    operator: 'or',
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

    return {items, selectedItems: getSelectedItems(props, state)};
  },

  refine(props, state, nextSelected) {
    const id = getId(props);
    return {
      ...state,
      // Setting the value to an empty string ensures that it is persisted in
      // the URL as an empty value.
      // This is necessary in the case where `defaultSelectedItems` contains one
      // item and we try to deselect it. `nextSelected` would be an empty array,
      // which would not be persisted to the URL.
      // {foo: ['bar']} => "foo[0]=bar"
      // {foo: []} => ""
      [id]: nextSelected.length > 0 ? nextSelected : '',
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {attributeName, operator, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    const addKey = operator === 'and' ?
      'addFacet' : 'addDisjunctiveFacet';
    const addRefinementKey = `${addKey}Refinement`;

    searchParameters = searchParameters.setQueryParameters({
      maxValuesPerFacet: Math.max(
        searchParameters.maxValuesPerFacet || 0,
        limit
      ),
    });

    searchParameters = searchParameters[addKey](attributeName);

    return getSelectedItems(props, state).reduce((res, val) =>
      res[addRefinementKey](attributeName, val)
    , searchParameters);
  },

  getMetadata(props, state) {
    const id = getId(props);
    return {
      id,
      filters: getSelectedItems(props, state).map(item => ({
        key: `${id}.${item}`,
        label: `${props.attributeName}: ${item}`,
        clear: nextState => {
          const nextSelectedItems = getSelectedItems(props, nextState).filter(
            other => other !== item
          );
          return {
            ...nextState,
            [id]: nextSelectedItems.length > 0 ? nextSelectedItems : '',
          };
        },
      })),
    };
  },
});
