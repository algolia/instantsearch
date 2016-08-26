import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

function getQuery(props, state) {
  if (typeof state[props.id] !== 'undefined') {
    return state[props.id];
  }
  return '';
}

export default createConnector({
  displayName: 'AlgoliaSearchBox',

  propTypes: {
    /**
     * URL state serialization key.
     * The state of this widget takes the form of a `string`.
     * @public
     */
    id: PropTypes.string,
  },

  defaultProps: {
    id: 'q',
  },

  getProps(props, state) {
    return {
      query: getQuery(props, state),
    };
  },

  refine(props, state, nextQuery) {
    return {
      ...state,
      [props.id]: nextQuery,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setQuery(getQuery(props, state));
  },

  getMetadata(props, state) {
    const query = getQuery(props, state);
    return {
      id: props.id,
      filters: !query ? [] : [{
        key: props.id,
        label: query,
        hide: true,
        clear: nextState => ({...nextState, [props.id]: ''}),
      }],
    };
  },
});
