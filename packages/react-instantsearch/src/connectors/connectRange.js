import {PropTypes} from 'react';
import {omit, isEmpty} from 'lodash';

import createConnector from '../core/createConnector';

/**
 * connectRange connector provides the logic to create connected
 * components that will give the ability for a user to refine results using
 * a numeric range.
 * @name connectRange
 * @kind connector
 * @propType {string} attributeName - Name of the attribute for faceting
 * @propType {{min: number, max: number}} defaultRefinement - Default searchState of the widget containing the start and the end of the range.
 * @propType {number} min - Minimum value. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} max - Maximum value. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 */

function getId(props) {
  return props.attributeName;
}

const namespace = 'range';

function getCurrentRefinement(props, searchState) {
  const id = getId(props);
  if (searchState[namespace] && typeof searchState[namespace][id] !== 'undefined') {
    let {min, max} = searchState[namespace][id];
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

  getProvidedProps(props, searchState, searchResults) {
    const {attributeName} = props;
    let {min, max} = props;

    const hasMin = typeof min !== 'undefined';
    const hasMax = typeof max !== 'undefined';

    if (!hasMin || !hasMax) {
      if (!searchResults.results) {
        return {
          canRefine: false,
        };
      }

      const stats = searchResults.results.getFacetByName(attributeName) ?
        searchResults.results.getFacetStats(attributeName) : null;

      if (!stats) {
        return {
          canRefine: false,
        };
      }

      if (!hasMin) {
        min = stats.min;
      }
      if (!hasMax) {
        max = stats.max;
      }
    }

    const count = searchResults.results ? searchResults.results
      .getFacetValues(attributeName)
      .map(v => ({
        value: v.name,
        count: v.count,
      })) : [];

    const {
      min: valueMin = min,
      max: valueMax = max,
    } = getCurrentRefinement(props, searchState);

    return {
      min,
      max,
      currentRefinement: {min: valueMin, max: valueMax},
      count,
      canRefine: true,
    };
  },

  refine(props, searchState, nextRefinement) {
    if (!isFinite(nextRefinement.min) || !isFinite(nextRefinement.max)) {
      throw new Error('You can\'t provide non finite values to the range connector');
    }
    return {
      ...searchState,
      [namespace]: {...searchState[namespace], [getId(props)]: nextRefinement},
    };
  },

  cleanUp(props, searchState) {
    const cleanState = omit(searchState, `${namespace}.${getId(props)}`);
    if (isEmpty(cleanState[namespace])) {
      return omit(cleanState, namespace);
    }
    return cleanState;
  },

  getSearchParameters(params, props, searchState) {
    const {attributeName} = props;
    const currentRefinement = getCurrentRefinement(props, searchState);
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

  getMetadata(props, searchState) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, searchState);
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
          [namespace]: {...nextState[namespace], [id]: {}},
        }),
      };
    }

    return {
      id,
      items: item ? [item] : [],
    };
  },
});
