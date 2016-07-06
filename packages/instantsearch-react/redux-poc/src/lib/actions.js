import algoliasearchHelper from 'algoliasearch-helper';

import actionTypes from './actionTypes';

export function searchSuccess(searchResults) {
  return {
    type: actionTypes.SEARCH_SUCCESS,
    searchResults,
  };
}

export function searchError(searchError) {
  return {
    type: actionTypes.SEARCH_ERROR,
    searchError,
  };
}

export function setQuery(query) {
  return {
    type: actionTypes.SET_QUERY,
    query,
  };
}

export function search(client) {
  return (dispatch, getState) => {
    const { indexName, searchParameters } = getState();
    dispatch({
      type: actionTypes.SEARCH,
    });
    const helper = algoliasearchHelper(client, indexName, searchParameters);
    helper
      .on('result', searchResults => {
        dispatch(searchSuccess(searchResults));
      })
      .on('error', searchError => {
        dispatch(searchError(searchError));
      });
    helper.search();
  };
}
