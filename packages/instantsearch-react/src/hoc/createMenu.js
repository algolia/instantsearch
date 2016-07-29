import {PropTypes} from 'react';

import createHOC from '../createHOC';
import facetRefiner from './facetRefiner';

// While it makes little difference since we only ever have either zero or one
// facet value, using disjunctive ensures that the API always sends all the
// facet values we need.
const FACET_TYPE = 'disjunctive';

export default createHOC({
  displayName: 'AlgoliaMenu',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    sortBy: PropTypes.arrayOf(PropTypes.string),
    limit: PropTypes.number.isRequired,
  },

  defaultProps: {
    sortBy: ['count:desc', 'name:asc'],
  },

  mapStateToProps(state, props) {
    return facetRefiner.mapStateToProps(state, {
      facetType: FACET_TYPE,
      attributeName: props.attributeName,
      sortBy: props.sortBy,
    });
  },

  configure(state, props) {
    return facetRefiner.configure(state, {
      facetType: FACET_TYPE,
      attributeName: props.attributeName,
      limit: props.limit,
    });
  },

  transformProps(props) {
    return facetRefiner.transformProps(props);
  },

  refine(state, props, value) {
    return facetRefiner.refine(state, {
      facetType: FACET_TYPE,
      attributeName: props.attributeName,
    }, props.selectedItems.indexOf(value) === -1 ? [value] : []);
  },
});
