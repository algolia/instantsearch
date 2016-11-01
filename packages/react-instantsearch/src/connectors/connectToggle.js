import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

function getId(props) {
  return props.id || props.attributeName;
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

export default createConnector({
  displayName: 'AlgoliaToggle',

  propTypes: {
    /**
     * URL state serialization key.
     * The state of this widget takes the form of a `string` that can be either
     * `'on'` or `'off'`.
     * Required when `attributeName` isn't present.
     * @public
     */
    id: PropTypes.string,

    /**
     * Label for this toggle.
     * @public
     */
    label: PropTypes.string,

    /**
     * Custom filter.
     * Takes in a `SearchParameters` and returns a new `SearchParameters` with
     * the filter applied.
     * @public
     */
    filter: PropTypes.func,

    /**
     * Name of the attribute on which to apply the `value` refinement.
     * Required when `value` is present.
     * @public
     */
    attributeName: PropTypes.string,

    /**
     * Value of the refinement to apply on `attributeName`.
     * Required when `attributeName` is present.
     * @public
     */
    value: PropTypes.any,

    /**
     * Default state of the widget. Should the toggle be checked by default?
     */
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
    const filters = [];
    if (checked) {
      filters.push({
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
