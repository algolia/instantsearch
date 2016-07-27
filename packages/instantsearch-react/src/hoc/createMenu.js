import {PropTypes} from 'react';

import createHOC from '../createHOC';
import facetRefiner from './facetRefiner';

const FACET_TYPE = 'conjunctive';

export default createHOC({
  displayName: 'AlgoliaMenu',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    showMore: PropTypes.bool,
    limitMax: PropTypes.number,
    limitMin: PropTypes.number,
  },

  defaultProps: {
    sortBy: ['isRefined'],
    showMore: false,
    limitMax: 20,
    limitMin: 10,
  },

  configure(state, props) {
    const valuesPerFacet = props.showMore ? props.limitMax : props.limitMin;
    return facetRefiner.configure(state, {
      facetType: FACET_TYPE,
      facetName: props.attributeName,
      valuesPerFacet,
    });
  },

  mapStateToProps(state, props) {
    return facetRefiner.mapStateToProps(state, {
      facetType: FACET_TYPE,
      facetName: props.attributeName,
    });
  },

  transformProps(props) {
    return facetRefiner.transformProps(props, {
      valuesPerFacet: props.showMore ? props.limitMax : props.limitMin,
    });
  },

  refine(state, props, value) {
    return facetRefiner.refine(state, {
      facetName: props.attributeName,
      facetType: FACET_TYPE,
    }, value ? [value] : []);
  },
});
