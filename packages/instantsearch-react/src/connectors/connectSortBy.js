import {PropTypes} from 'react';

import createConnector from '../createConnector';

function getSelectedIndex(props, state) {
  const {id} = props;
  if (state[id]) {
    return state[id];
  }
  if (props.defaultSelectedIndex) {
    return props.defaultSelectedIndex;
  }
  return null;
}

export default createConnector({
  displayName: 'AlgoliaSortBy',

  propTypes: {
    id: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      index: PropTypes.string.isRequired,
    })).isRequired,
    defaultSelectedIndex: PropTypes.string,
  },

  defaultProps: {
    id: 'sort_by',
  },

  getProps(props, state) {
    const selectedIndex = getSelectedIndex(props, state);
    return {selectedIndex};
  },

  refine(props, state, nextSelectedIndex) {
    return {
      ...state,
      [props.id]: nextSelectedIndex,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const selectedIndex = getSelectedIndex(props, state);
    return searchParameters.setIndex(selectedIndex);
  },

  getMetadata(props) {
    return {id: props.id};
  },
});
