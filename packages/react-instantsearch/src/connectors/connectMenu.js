import {PropTypes} from 'react';
import {omit, isEmpty, orderBy} from 'lodash';

import createConnector from '../core/createConnector';

function getId(props) {
  return props.attributeName;
}

const namespace = 'menu';

function getCurrentRefinement(props, searchState) {
  const id = getId(props);
  if (searchState[namespace] && typeof searchState[namespace][id] !== 'undefined') {
    if (searchState[namespace][id] === '') {
      return null;
    }
    return searchState[namespace][id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return null;
}

function getValue(name, props, searchState) {
  const currentRefinement = getCurrentRefinement(props, searchState);
  return name === currentRefinement ? '' : name;
}

const sortBy = ['count:desc', 'name:asc'];

/**
 * connectMenu connector provides the logic to build a widget that will
 * give the user tha ability to choose a single value for a specific facet.
 * @name connectMenu
 * @kind connector
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limitMin=10] - the minimum number of diplayed items
 * @propType {number} [limitMax=20] - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string} defaultRefinement - the value of the item selected by default
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{count: number, isRefined: boolean, label: string, value: string}>} items - the list of items the Menu can display.
 * @providedPropType {function} searchForFacetValues - a function to toggle a search for facet values
 */
export default createConnector({
  displayName: 'AlgoliaMenu',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    defaultRefinement: PropTypes.string,
    transformItems: PropTypes.func,
  },

  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  },

  getProvidedProps(props, searchState, searchResults, meta, searchForFacetValuesResults) {
    const {results} = searchResults;
    const {attributeName, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    const canRefine =
      Boolean(results) &&
      Boolean(results.getFacetByName(attributeName));

    const isFromSearch = Boolean(searchForFacetValuesResults
      && searchForFacetValuesResults[attributeName]
      && searchForFacetValuesResults.query !== '');
    const searchForFacetValues = props.searchForFacetValues ? this.searchForFacetValues : undefined;

    if (!canRefine) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(props, searchState),
        isFromSearch,
        searchForFacetValues,
        canRefine,
      };
    }

    const items = isFromSearch
      ? searchForFacetValuesResults[attributeName]
        .map(
          v => ({
            label: v.value,
            value: getValue(v.value, props, searchState),
            _highlightResult: {label: {value: v.highlighted}},
            count: v.count,
            isRefined: v.isRefined,
          }))
      : results
        .getFacetValues(attributeName, {sortBy})
        .map(v => ({
          label: v.name,
          value: getValue(v.name, props, searchState),
          count: v.count,
          isRefined: v.isRefined,
        }));

    const sortedItems = !isFromSearch && props.searchForFacetValues ?
      orderBy(items, ['isRefined', 'count', 'label'], ['desc', 'desc', 'asc']) : items;
    const transformedItems = props.transformItems ? props.transformItems(sortedItems) : sortedItems;

    return {
      items: transformedItems.slice(0, limit),
      currentRefinement: getCurrentRefinement(props, searchState),
      isFromSearch,
      searchForFacetValues,
      canRefine: items.length > 0,
    };
  },

  refine(props, searchState, nextRefinement) {
    const id = getId(props);
    return {
      ...searchState,
      [namespace]: {...searchState[namespace], [id]: nextRefinement ? nextRefinement : ''},
    };
  },

  searchForFacetValues(props, searchState, nextRefinement) {
    return {facetName: props.attributeName, query: nextRefinement};
  },

  cleanUp(props, searchState) {
    const cleanState = omit(searchState, `${namespace}.${getId(props)}`);
    if (isEmpty(cleanState[namespace])) {
      return omit(cleanState, namespace);
    }
    return cleanState;
  },

  getSearchParameters(searchParameters, props, searchState) {
    const {attributeName, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    searchParameters = searchParameters.setQueryParameters({
      maxValuesPerFacet: Math.max(
        searchParameters.maxValuesPerFacet || 0,
        limit
      ),
    });

    searchParameters = searchParameters.addDisjunctiveFacet(attributeName);

    const currentRefinement = getCurrentRefinement(props, searchState);
    if (currentRefinement !== null) {
      searchParameters = searchParameters.addDisjunctiveFacetRefinement(
        attributeName,
        currentRefinement
      );
    }

    return searchParameters;
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, searchState);
    return {
      id,
      items: currentRefinement === null ? [] : [{
        label: `${props.attributeName}: ${currentRefinement}`,
        attributeName: props.attributeName,
        value: nextState => ({
          ...nextState,
          [namespace]: {...nextState[namespace], [id]: ''},
        }),
        currentRefinement,
      }],
    };
  },
});
