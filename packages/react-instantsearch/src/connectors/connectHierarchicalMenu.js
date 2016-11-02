import {PropTypes} from 'react';

import createConnector from '../core/createConnector';
import {SearchParameters} from 'algoliasearch-helper';

function getCurrentRefinement(props, state) {
  const id = props.id;
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

function getValue(path, props, state) {
  const {
    id,
    attributes,
    separator,
    rootPath,
    showParentLevel,
  } = props;

  const currentRefinement = getCurrentRefinement(props, state);
  let nextRefinement;

  if (currentRefinement === null) {
    nextRefinement = path;
  } else {
    const tmpSearchParameters = new SearchParameters({
      hierarchicalFacets: [{
        name: id,
        attributes,
        separator,
        rootPath,
        showParentLevel,
      }],
    });

    nextRefinement = tmpSearchParameters
      .toggleHierarchicalFacetRefinement(id, currentRefinement)
      .toggleHierarchicalFacetRefinement(id, path)
      .getHierarchicalRefinement(id)[0];
  }

  return nextRefinement;
}

function transformValue(value, limit, props, state) {
  const limitValue = value.slice(0, limit);
  return limitValue.map(v => ({
    label: v.name,
    value: getValue(v.path, props, state),
    count: v.count,
    isRefined: v.isRefined,
    children: v.data && transformValue(v.data, limit, props, state),
  }));
}

export default createConnector({
  displayName: 'AlgoliaHierarchicalMenu',

  propTypes: {
    /**
     * URL state serialization key.
     * The state of this widget takes the shape of a `string`, which corresponds
     * to the full path of the current selected refinement.
     * @public
     */
    id: PropTypes.string.isRequired,

    /**
     * List of attributes to use to generate the hierarchy of the menu.
     * See the example for the convention to follow.
     * @public
     */
    attributes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /**
     * Separator used in the attributes to separate level values.
     * @public
     */
    separator: PropTypes.string,

    /**
     * Prefix path to use if the first level is not the root level.
     * @public
     */
    rootPath: PropTypes.string,

    /**
     * Show the parent level of the current refined value
     * @public
     */
    showParentLevel: PropTypes.bool,

    /**
     * How to sort refinement values.
     * See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values)
     * for the full list of options.
     * @public
     */
    sortBy: PropTypes.arrayOf(PropTypes.string),

    /**
     * Default state of this widget.
     * @public
     */
    defaultRefinement: PropTypes.string,

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
     * Maximum number of refinement values.
     * Ignored when `showMore` is `false`.
     * @public
     */
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
      items: value.data ? transformValue(value.data, limit, props, state) : [],
      currentRefinement: getCurrentRefinement(props, state),
    };
  },

  refine(props, state, nextRefinement) {
    return {
      ...state,
      [props.id]: nextRefinement || '',
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

    const currentRefinement = getCurrentRefinement(props, state);
    if (currentRefinement !== null) {
      searchParameters = searchParameters.toggleHierarchicalFacetRefinement(
        id,
        currentRefinement
      );
    }

    return searchParameters;
  },

  getMetadata(props, state) {
    const {id} = props;
    const currentRefinement = getCurrentRefinement(props, state);
    return {
      id,
      filters: !currentRefinement ? [] : [{
        label: `${id}: ${currentRefinement}`,
        clear: nextState => ({
          ...nextState,
          [id]: '',
        }),
      }],
    };
  },
});
