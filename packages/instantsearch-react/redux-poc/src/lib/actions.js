import actionTypes from './actionTypes';

export function retrieveResultSuccess(result) {
  return {
    type: actionTypes.RETRIEVE_RESULT_SUCCESS,
    result,
  };
}

export function setQuery(query) {
  return {
    type: actionTypes.SET_QUERY,
    query,
  };
}
