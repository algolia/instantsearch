import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

function getId(props) {
  return props.attributeName;
}

function getCurrentRefinement(props, state) {
  const id = getId(props);
  if (state[id]) {
    return state[id] === 'on';
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return false;
}

/**
 * connectToggle connector provides the logic to build a widget that will
 *  provides an on/off filtering feature based on an attribute value. Note that if you provide an “off” option, it will be refined at initialization.
 * @name connectToggle
 * @kind connector
 * @category connector
 * @propType {string} attributeName - Name of the attribute on which to apply the `value` refinement. Required when `value` is present.
 * @propType {string} label - Label for this toggle.
 * @propType {string} function - Custom filter. Takes in a `SearchParameters` and returns a new `SearchParameters` with the filter applied.
 * @propType {string} value - Value of the refinement to apply on `attributeName`. Required when `attributeName` is present.
 * @propType {boolean} [defaultChecked=false] - Default state of the widget. Should the toggle be checked by default?
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 */
export default createConnector({
  displayName: 'AlgoliaToggle',

  propTypes: {
    label: PropTypes.string,
    filter: PropTypes.func,
    attributeName: PropTypes.string,
    value: PropTypes.any,
    defaultRefinement: PropTypes.bool,
  },

  getProps(props, state) {
    const checked = getCurrentRefinement(props, state);
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
    const checked = getCurrentRefinement(props, state);

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
    const checked = getCurrentRefinement(props, state);
    const items = [];
    if (checked) {
      items.push({
        label: props.label,
        currentRefinement: props.label,
        attributeName: props.attributeName,
        value: nextState => ({
          ...nextState,
          [id]: 'off',
        }),
      });
    }
    return {id, items};
  },
});
