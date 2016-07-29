import {PropTypes} from 'react';

import createHOC from '../createHOC';
import facetRefiner from './facetRefiner';

const operatorToFacetType = {
  or: 'disjunctive',
  and: 'conjunctive',
};

export default createHOC({
  displayName: 'AlgoliaRefinementList',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    operator: PropTypes.oneOf(['and', 'or']),
    sortBy: PropTypes.arrayOf(PropTypes.string),
    limit: PropTypes.number.isRequired,
  },

  defaultProps: {
    operator: 'or',
    sortBy: ['isRefined'],
  },

  mapStateToProps(state, config) {
    const {attributeName, operator, sortBy} = config;
    const facetType = operatorToFacetType[operator];
    return facetRefiner.mapStateToProps(state, {
      facetType,
      attributeName,
      sortBy,
    });
  },

  configure(state, props) {
    const {attributeName, operator, limit} = props;
    const facetType = operatorToFacetType[operator];
    return facetRefiner.configure(state, {
      facetType,
      attributeName,
      limit,
    });
  },

  transformProps(props) {
    return facetRefiner.transformProps(props);
  },

  refine(state, props, values) {
    const {operator, attributeName} = props;
    const facetType = operatorToFacetType[operator];
    return facetRefiner.refine(state, {
      facetType,
      attributeName,
    }, values);
  },
});
