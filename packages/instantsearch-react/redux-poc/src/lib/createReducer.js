import algoliasearchHelper from 'algoliasearch-helper';

import actionTypes from './actionTypes';

export default function createReducer(indexName) {
  const initialState = {
    indexName,
    searching: false,
    searchParameters: algoliasearchHelper(null, indexName).getState(),
    searchResults: null,
    searchError: null,
  };

  return (state = initialState, action) => {
    switch (action.type) {
      case actionTypes.SEARCH:
        return {
          ...state,
          searching: true,
        };
      case actionTypes.SEARCH_SUCCESS:
        return {
          ...state,
          searching: false,
          searchResults: action.searchResults,
        };
      case actionTypes.SEARCH_ERROR:
        return {
          ...state,
          searching: false,
          searchError: action.searchError,
        };
      case actionTypes.SET_QUERY:
        return {
          ...state,
          searchParameters: algoliasearchHelper()
            .setState(state.searchParameters)
            .setQuery(action.query)
            .getState(),
        };
    }
    return state;
  }
}
