import algoliasearchHelper from 'algoliasearch-helper';

import actionTypes from './actionTypes';

export default function reducer(state, action) {
  switch (action.type) {
    case actionTypes.RETRIEVE_RESULT_SUCCESS:
      return {
        ...state,
        result: action.result,
      };
    case actionTypes.SET_QUERY:
      return {
        ...state,
        helperState: algoliasearchHelper()
          .setState(state.helperState)
          .setQuery(action.query)
          .getState(),
      };
  }
  return state;
}
