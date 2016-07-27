import {PropTypes} from 'react';

import createHOC from '../createHOC';
import facetRefiner from './facetRefiner';

const operatorToFacetType = {
  or: 'disjunctive',
  and: 'conjunctive',
};

export default createHOC({
  displayName: 'AlgoliaFacetRefiner',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    operator: PropTypes.oneOf(['and', 'or']),
    sortBy: PropTypes.arrayOf(PropTypes.string),
    showMore: PropTypes.bool,
    limitMax: PropTypes.number,
    limitMin: PropTypes.number,
  },

  defaultProps: {
    operator: 'or',
    sortBy: ['isRefined'],
    showMore: false,
    limitMax: 20,
    limitMin: 10,
  },

  configure(state, props) {
    const {attributeName, operator, showMore, limitMax, limitMin} = props;
    const facetType = operatorToFacetType[operator];
    const valuesPerFacet = showMore ? limitMax : limitMin;
    return facetRefiner.configure(state, {
      facetType,
      facetName: attributeName,
      valuesPerFacet,
    });
  },

  mapStateToProps(state, props) {
    const {attributeName, operator, sortBy} = props;
    const facetType = operatorToFacetType[operator];

    return facetRefiner.mapStateToProps(state, {
      facetType,
      facetName: attributeName,
      sortBy,
    });
  },

  transformProps(props) {
    const valuesPerFacet = props.showMore ? props.limitMax : props.limitMin;
    return facetRefiner.transformProps(props, {valuesPerFacet});
  },

  refine(state, props, values) {
    const {operator, attributeName} = props;
    const facetType = operatorToFacetType[operator];

    return facetRefiner.refine(state, {
      facetType,
      facetName: attributeName,
    }, values);
  },
});
