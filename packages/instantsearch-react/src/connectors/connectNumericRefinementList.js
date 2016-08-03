import {PropTypes} from 'react';
import find from 'lodash/collection/find';
import includes from 'lodash/collection/includes';

import createConnector from '../createConnector';

function stringifyItem(item) {
  return `${item.start ? item.start : ''}:${item.end ? item.end : ''}`;
}

function parseItem(value) {
  const [startStr, endStr] = value.split(':');
  return {
    start: startStr.length > 0 ? parseInt(startStr, 10) : null,
    end: endStr.length > 0 ? parseInt(endStr, 10) : null,
  };
}

export default createConnector({
  displayName: 'AlgoliaNumericRefinementList',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node,
      start: PropTypes.number,
      end: PropTypes.number,
    })),
  },

  mapStateToProps(state, props) {
    const {searchParameters} = state;
    const {attributeName, items} = props;
    const lte = searchParameters.getNumericRefinement(attributeName, '<=');
    const gte = searchParameters.getNumericRefinement(attributeName, '>=');
    const selectedItem = find(items, item =>
      // For clarity's sake.
      // eslint-disable-next-line no-extra-parens
      ((!gte && !item.start) || includes(gte, item.start)) &&
      // eslint-disable-next-line no-extra-parens
      ((!lte && !item.end) || includes(lte, item.end))
    );
    return {
      items: items.map(item => ({
        label: item.label,
        value: stringifyItem(item),
      })),
      selectedItem: stringifyItem(selectedItem),
    };
  },

  refine(state, props, value) {
    const {attributeName} = props;
    const {start, end} = parseItem(value);
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
