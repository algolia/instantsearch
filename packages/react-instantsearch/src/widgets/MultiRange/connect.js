import {PropTypes} from 'react';
import {find} from 'lodash';

import createConnector from '../../core/createConnector';

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
  displayName: 'AlgoliaMultiRange',

  propTypes: {
    /**
     * URL state serialization key. Defaults to the value of `attributeName`.
     * The state of this widget takes the shape of a `string` with a pattern of
     * `'{start}:{end}'` which corresponds to the current selected item.
     * For instance, when the selected item is `{start: 10, end: 20}`, the state
     * of the widget is `'10:20'`. When `start` isn't defined, the state of the
     * widget is `':{end}'`, and the same way around when `end` isn't defined.
     * However, when neither `start` nor `end` are defined, the state is an
     * empty string.
     * @public
     */
    id: PropTypes.string,

    /**
     * Name of the attribute for faceting
     * @public
     */
    attributeName: PropTypes.string.isRequired,

    /**
     * List of options.
     * @public
     * @defines MultiRangeItem
     */
    items: PropTypes.arrayOf(PropTypes.shape({
      /**
       * Node to render in place of the option.
       */
      label: PropTypes.node,
      /**
       * Inclusive start of the range.
       */
      start: PropTypes.number,
      /**
       * Inclusive end of the range.
       */
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
