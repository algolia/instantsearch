import {PropTypes} from 'react';

import createConnector from '../createConnector';

function getId(props) {
  return props.id || props.attributeName;
}

function getChecked(props, state) {
  const id = getId(props);
  if (state[id]) {
    return state[id] === 'on';
  }
  if (props.defaultChecked) {
    return props.defaultChecked;
  }
  return false;
}

export default createConnector({
  displayName: 'AlgoliaToggle',

  propTypes: {
    id: PropTypes.string,
    label: PropTypes.string,
    filter: PropTypes.func,
    attributeName: PropTypes.string,
    value: PropTypes.any,
    defaultChecked: PropTypes.bool,
  },

  getProps(props, state) {
    const checked = getChecked(props, state);
    return {checked};
  },

  refine(props, state, nextChecked) {
    return {
      ...state,
      [getId(props, state)]: nextChecked ? 'on' : 'off',
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {attributeName, value, filter} = props;
    const checked = getChecked(props, state);

    if (checked) {
      if (attributeName) {
        searchParameters = searchParameters
          .addFacet(attributeName)
          .addFacetRefinement(
            attributeName,
            value
          );
      }
      if (filter) {
        searchParameters = filter(searchParameters);
      }
    }

    return searchParameters;
  },

  getMetadata(props, state) {
    const id = getId(props);
    const checked = getChecked(props, state);
    const filters = [];
    if (checked) {
      filters.push({
        key: id,
        label: props.label,
        clear: nextState => ({
          ...nextState,
          [id]: 'off',
        }),
      });
    }
    return {id, filters};
  },
});
