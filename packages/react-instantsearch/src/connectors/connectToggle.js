import {PropTypes} from 'react';
import {omit, isEmpty} from 'lodash';
import createConnector from '../core/createConnector';

function getId(props) {
  return props.attributeName;
}

const namespace = 'toggle';

function getCurrentRefinement(props, searchState) {
  const id = getId(props);
  if (searchState[namespace] && searchState[namespace][id]) {
    return searchState[namespace][id];
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
 * @propType {string} attributeName - Name of the attribute on which to apply the `value` refinement. Required when `value` is present.
 * @propType {string} label - Label for this toggle.
 * @propType {string} function - Custom filter. Takes in a `SearchParameters` and returns a new `SearchParameters` with the filter applied.
 * @propType {string} value - Value of the refinement to apply on `attributeName`. Required when `attributeName` is present.
 * @propType {boolean} [defaultChecked=false] - Default searchState of the widget. Should the toggle be checked by default?
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
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

  getProvidedProps(props, searchState) {
    const checked = getCurrentRefinement(props, searchState);
    return {checked};
  },

  refine(props, searchState, nextChecked) {
    return {
      ...searchState,
      [namespace]: {[getId(props, searchState)]: nextChecked},
    };
  },

  cleanUp(props, searchState) {
    const cleanState = omit(searchState, `${namespace}.${getId(props)}`);
    if (isEmpty(cleanState[namespace])) {
      return omit(cleanState, namespace);
    }
    return cleanState;
  },

  getSearchParameters(searchParameters, props, searchState) {
    const {attributeName, value, filter} = props;
    const checked = getCurrentRefinement(props, searchState);

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

  getMetadata(props, searchState) {
    const id = getId(props);
    const checked = getCurrentRefinement(props, searchState);
    const items = [];
    if (checked) {
      items.push({
        label: props.label,
        currentRefinement: props.label,
        attributeName: props.attributeName,
        value: nextState => ({
          ...nextState,
          [namespace]: {[id]: false},
        }),
      });
    }
    return {id, items};
  },
});
