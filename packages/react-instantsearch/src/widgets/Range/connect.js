import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

function getId(props) {
  return props.id || props.attributeName;
}

function getValue(props, state) {
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
    /**
     * URL state serialization key. Defaults to the value of `attributeName`.
     * @public
     */
    id: PropTypes.string,

    /**
     * Name of the attribute for faceting
     * @public
     */
    attributeName: PropTypes.string.isRequired,

    /**
     * Default state of the widget.
     * @public
     * @defines RangeState
     */
    defaultRefinement: PropTypes.shape({
      /**
       * Start of the range
       */
      min: PropTypes.number.isRequired,
      /**
       * End of the range
       */
      max: PropTypes.number.isRequired,
    }),

    /**
     * Minimum value.
     * When this isn't set, the minimum value will be automatically computed by
     * Algolia using the data in the index.
     * @public
     */
    min: PropTypes.number,

    /**
     * Maximum value.
     * When this isn't set, the maximum value will be automatically computed by
     * Algolia using the data in the index.
     * @public
     */
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
    } = getValue(props, state);

    return {
      min,
      max,
      value: {min: valueMin, max: valueMax},
      count,
    };
  },

  refine(props, state, nextValue) {
    return {
      ...state,
      [getId(props)]: nextValue,
    };
  },

  getSearchParameters(params, props, state) {
    const {attributeName} = props;
    const value = getValue(props, state);
    params = params.addDisjunctiveFacet(attributeName);

    const {min, max} = value;
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
    const value = getValue(props, state);
    let filter;
    const hasMin = typeof value.min !== 'undefined';
    const hasMax = typeof value.max !== 'undefined';
    if (hasMin || hasMax) {
      let filterLabel = '';
      if (hasMin) {
        filterLabel += `${value.min} <= `;
      }
      filterLabel += props.attributeName;
      if (hasMax) {
        filterLabel += ` <= ${value.max}`;
      }
      filter = {
        label: filterLabel,
        clear: nextState => ({
          ...nextState,
          [id]: {},
        }),
      };
    }

    return {
      id,
      filters: filter ? [filter] : [],
    };
  },
});
