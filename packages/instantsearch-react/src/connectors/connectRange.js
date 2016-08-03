import {PropTypes} from 'react';
import union from 'lodash/array/union';

import {assertFacetDefined} from '../utils';
import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaRange',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    defaultValue: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
  },

  mapStateToProps(state, props) {
    const {
      searchParameters,
      searchResults,
      searchResultsSearchParameters,
    } = state;
    const {attributeName} = props;
    let {min, max} = props;

    const hasMin = typeof min !== 'undefined';
    const hasMax = typeof max !== 'undefined';

    if (!hasMin || !hasMax) {
      if (!searchResults) {
        return {
          shouldRender: false,
        };
      }
      assertFacetDefined(
        searchResultsSearchParameters,
        searchResults,
        attributeName
      );
      const stats = searchResults.getFacetStats(attributeName);
      if (!stats) {
        return {
          shouldRender: false,
        };
      }
      if (!hasMin) {
        min = stats.min;
      }
      if (!hasMax) {
        max = stats.max;
      }
    }

    const lte = searchParameters.getNumericRefinement(attributeName, '<=');
    const gte = searchParameters.getNumericRefinement(attributeName, '>=');

    const valueMin = gte ? gte[0] : min;
    const valueMax = lte ? lte[0] : max;

    return {
      shouldRender: true,
      min,
      max,
      value: [valueMin, valueMax],
    };
  },

  configure(state, props) {
    const {attributeName} = props;
    return state.setQueryParameters({
      disjunctiveFacets: union(state.disjunctiveFacets, [attributeName]),
    });
  },

  shouldRender(props) {
    return props.shouldRender;
  },

  transformProps(props) {
    return {
      min: props.min,
      max: props.max,
      value: props.value,
    };
  },

  refine(state, props, value) {
    const {attributeName} = props;
    const [start, end] = value;
    state = state.clearRefinements(attributeName);
    if (start) {
      state = state.addNumericRefinement(attributeName, '>=', start);
    }
    if (end) {
      state = state.addNumericRefinement(attributeName, '<=', end);
    }
    return state;
  },
});
