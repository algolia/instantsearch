import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

/**
 * connectRange connector provides the logic to create connected
 * components that will give the ability for a user to refine results using
 * a numeric range.
 * @name connectRange
 * @kind connector
 * @category connector
 * @propType {string} id - URL state serialization key. Defaults to the value of `attributeName`.
 * @propType {string} attributeName - Name of the attribute for faceting
 * @propType {{min: number, max: number}} defaultRefinement - Default state of the widget containing the start and the end of the range.
 * @propType {number} min - Minimum value. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} max - Maximum value. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 */

function getId(props) {
  return props.id || props.attributeName;
}

function getCurrentRefinement(props, state) {
  const id = getId(props);
  if (typeof state[id] !== 'undefined') {
    let {min, max} = state[id];
    if (typeof min === 'string') {
      min = parseInt(min, 10);
    }
    if (typeof max === 'string') {
      max = parseInt(max, 10);
    }
    return {min, max};
  }
  if (typeof props.defaultRefinement !== 'undefined') {
    return props.defaultRefinement;
  }
  return {};
}
export default createConnector({
  displayName: 'AlgoliaRange',

  propTypes: {
    id: PropTypes.string,
    attributeName: PropTypes.string.isRequired,
    defaultRefinement: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
    }),
    min: PropTypes.number,
    max: PropTypes.number,
  },

  getProps(props, state, search) {
    const {attributeName} = props;
    let {min, max} = props;

    const hasMin = typeof min !== 'undefined';
    const hasMax = typeof max !== 'undefined';

    if (!hasMin || !hasMax) {
      if (!search.results) {
        return null;
      }

      const stats = search.results.getFacetStats(attributeName);
      if (!stats) {
        return null;
      }

      if (!hasMin) {
        min = stats.min;
      }
      if (!hasMax) {
        max = stats.max;
      }
    }

    const count = search.results ? search.results
      .getFacetValues(attributeName)
      .map(v => ({
        value: v.name,
        count: v.count,
      })) : [];

    const {
      min: valueMin = min,
      max: valueMax = max,
    } = getCurrentRefinement(props, state);

    return {
      min,
      max,
      currentRefinement: {min: valueMin, max: valueMax},
      count,
    };
  },

  refine(props, state, nextRefinement) {
    return {
      ...state,
      [getId(props)]: nextRefinement,
    };
  },

  getSearchParameters(params, props, state) {
    const {attributeName} = props;
    const currentRefinement = getCurrentRefinement(props, state);
    params = params.addDisjunctiveFacet(attributeName);

    const {min, max} = currentRefinement;
    if (typeof min !== 'undefined') {
      params = params.addNumericRefinement(attributeName, '>=', min);
    }
    if (typeof max !== 'undefined') {
      params = params.addNumericRefinement(attributeName, '<=', max);
    }

    return params;
  },

  getMetadata(props, state) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, state);
    let item;
    const hasMin = typeof currentRefinement.min !== 'undefined';
    const hasMax = typeof currentRefinement.max !== 'undefined';
    if (hasMin || hasMax) {
      let itemLabel = '';
      if (hasMin) {
        itemLabel += `${currentRefinement.min} <= `;
      }
      itemLabel += props.attributeName;
      if (hasMax) {
        itemLabel += ` <= ${currentRefinement.max}`;
      }
      item = {
        label: itemLabel,
        currentRefinement,
        attributeName: props.attributeName,
        value: nextState => ({
          ...nextState,
          [id]: {},
        }),
      };
    }

    return {
      id,
      items: item ? [item] : [],
    };
  },
});
