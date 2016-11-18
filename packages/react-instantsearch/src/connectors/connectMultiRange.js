import {PropTypes} from 'react';
import {find} from 'lodash';

import createConnector from '../core/createConnector';

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
  return props.attributeName;
}

function getCurrentRefinement(props, state) {
  const id = getId(props);
  if (typeof state[id] !== 'undefined') {
    return state[id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return '';
}

/**
 * connectMultiRange connector provides the logic to build a widget that will
 * give the user the ability to select a range value for a numeric attribute.
 * Ranges are defined statically.
 * @name connectMultiRange
 * @kind connector
 * @category connector
 * @propType {string} attributeName - the name of the attribute in the records
 * @propType {{label: string, start: number, end: number}[]} items - List of options. With a text label, and upper and lower bounds.
 * @propType {string} defaultRefinement - the value of the item selected by default, follow the shape of a `string` with a pattern of `'{start}:{end}'`.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string} currentRefinement - the refinement currently applied.  follow the shape of a `string` with a pattern of `'{start}:{end}'` which corresponds to the current selected item. For instance, when the selected item is `{start: 10, end: 20}`, the state of the widget is `'10:20'`. When `start` isn't defined, the state of the widget is `':{end}'`, and the same way around when `end` isn't defined. However, when neither `start` nor `end` are defined, the state is an empty string.
 * @providedPropType {array.<{isRefined: boolean, label: string, value: string}>} items - the list of ranges the MultiRange can display.
 */
export default createConnector({
  displayName: 'AlgoliaMultiRange',

  propTypes: {
    id: PropTypes.string,
    attributeName: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node,
      start: PropTypes.number,
      end: PropTypes.number,
    })).isRequired,
  },

  getProps(props, state) {
    const {items} = props;
    const currentRefinement = getCurrentRefinement(props, state);

    return {
      items: items.map(item => {
        const value = stringifyItem(item);
        return {
          label: item.label,
          value,
          isRefined: value === currentRefinement,
        };
      }),
      currentRefinement,
    };
  },

  refine(props, state, nextRefinement) {
    return {
      ...state,
      [getId(props, state)]: nextRefinement,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const {attributeName} = props;
    const {start, end} = parseItem(getCurrentRefinement(props, state));

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
    const value = getCurrentRefinement(props, state);
    const items = [];
    if (value !== '') {
      const {label} = find(props.items, item => stringifyItem(item) === value);
      items.push({
        label: `${props.attributeName}: ${label}`,
        attributeName: props.attributeName,
        currentRefinement: label,
        value: nextState => ({
          ...nextState,
          [id]: '',
        }),
      });
    }
    return {id, items};
  },
});
