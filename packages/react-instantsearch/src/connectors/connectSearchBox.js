import createConnector from '../core/createConnector';
import {omit} from 'lodash';
import {PropTypes} from 'react';

function getId() {
  return 'query';
}

function getCurrentRefinement(props, searchState) {
  const id = getId();
  if (typeof searchState[id] !== 'undefined') {
    return searchState[id];
  }
  if (typeof props.defaultRefinement !== 'undefined') {
    return props.defaultRefinement;
  }
  return '';
}

/**
 * connectSearchBox connector provides the logic to build a widget that will
 * let the user search for a query.
 * @name connectSearchBox
 * @kind connector
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the query to search for.
 */
export default createConnector({
  displayName: 'AlgoliaSearchBox',

  propTypes: {
    defaultRefinement: PropTypes.string,
  },

  getProvidedProps(props, searchState) {
    return {
      currentRefinement: getCurrentRefinement(props, searchState),
    };
  },

  refine(props, searchState, nextQuery) {
    const id = getId();
    return {
      ...searchState,
      [id]: nextQuery,
    };
  },

  cleanUp(props, searchState) {
    return omit(searchState, getId());
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQuery(getCurrentRefinement(props, searchState));
  },
});
