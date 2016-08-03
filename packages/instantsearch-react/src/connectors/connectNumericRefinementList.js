import {PropTypes} from 'react';
import {find} from 'lodash';

import createConnector from '../createConnector';

function stringifyItem(item) {
  if (typeof item.start === 'undefined' && typeof item.end === 'undefined') {
    return '';
  }
  return `${item.start ? item.start : ''}:${item.end ? item.end : ''}`;
}

function parseItem(value) {
  if (value.length === 0) {
    return {start: null, end: null};
  }
  const [startStr, endStr] = value.split(':');
  return {
    start: startStr.length > 0 ? parseInt(startStr, 10) : null,
    end: endStr.length > 0 ? parseInt(endStr, 10) : null,
  };
}

function getId(props) {
  return props.id || props.attributeName;
}

function getSelectedItem(props, state) {
  const id = getId(props);
  if (typeof state[id] !== 'undefined') {
    return state[id];
  }
  if (props.defaultSelectedItem) {
    return props.defaultSelectedItem;
  }
  return '';
}

export default createConnector({
  displayName: 'AlgoliaNumericRefinementList',

  propTypes: {
    attributeName: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node,
      start: PropTypes.number,
      end: PropTypes.number,
    })).isRequired,
  },

  getProps(props, state) {
    const {items} = props;
    const selectedItem = getSelectedItem(props, state);

    return {
      items: items.map(item => ({
        label: item.label,
        value: stringifyItem(item),
      })),
      selectedItem,
    };
  },

  refine(props, state, nextSelectedItem) {
    return {
      ...state,
      [getId(props, state)]: nextSelectedItem,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {attributeName} = props;
    const {start, end} = parseItem(getSelectedItem(props, state));

    if (start) {
      searchParameters = searchParameters.addNumericRefinement(
        attributeName,
        '>=',
        start
      );
    }
    if (end) {
      searchParameters = searchParameters.addNumericRefinement(
        attributeName,
        '<=',
        end
      );
    }
    return searchParameters;
  },

  getMetadata(props, state) {
    const id = getId(props);
    const value = getSelectedItem(props, state);
    const filters = [];
    if (value !== '') {
      const {label} = find(props.items, item => stringifyItem(item) === value);
      filters.push({
        key: `${id}.${value}`,
        label: `${props.attributeName}: ${label}`,
        clear: nextState => ({
          ...nextState,
          [id]: '',
        }),
      });
    }
    return {id, filters};
  },
});
