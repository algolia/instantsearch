import {PropTypes} from 'react';
import {find, omit, isEmpty} from 'lodash';

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

const namespace = 'multiRange';

function getId(props) {
  return props.attributeName;
}

function getCurrentRefinement(props, searchState) {
  const id = getId(props);
  if (searchState[namespace] && typeof searchState[namespace][id] !== 'undefined') {
    return searchState[namespace][id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return '';
}

function isRefinementsRangeIncludesInsideItemRange(stats, start, end) {
  return stats.min > start && stats.min < end || stats.max > start && stats.max < end;
}

function isItemRangeIncludedInsideRefinementsRange(stats, start, end) {
  return start > stats.min && start < stats.max || end > stats.min && end < stats.max;
}

function itemHasRefinement(attributeName, results, value) {
  const stats = results.getFacetByName(attributeName) ?
        results.getFacetStats(attributeName) : null;
  const range = value.split(':');
  const start = Number(range[0]) === 0 || value === '' ? Number.NEGATIVE_INFINITY : Number(range[0]);
  const end = Number(range[1]) === 0 || value === '' ? Number.POSITIVE_INFINITY : Number(range[1]);
  return !(Boolean(stats) &&
        (isRefinementsRangeIncludesInsideItemRange(stats, start, end)
       || isItemRangeIncludedInsideRefinementsRange(stats, start, end)));
}

/**
 * connectMultiRange connector provides the logic to build a widget that will
 * give the user the ability to select a range value for a numeric attribute.
 * Ranges are defined statically.
 * @name connectMultiRange
 * @kind connector
 * @propType {string} attributeName - the name of the attribute in the records
 * @propType {{label: string, start: number, end: number}[]} items - List of options. With a text label, and upper and lower bounds.
 * @propType {string} defaultRefinement - the value of the item selected by default, follow the shape of a `string` with a pattern of `'{start}:{end}'`.
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied.  follow the shape of a `string` with a pattern of `'{start}:{end}'` which corresponds to the current selected item. For instance, when the selected item is `{start: 10, end: 20}`, the searchState of the widget is `'10:20'`. When `start` isn't defined, the searchState of the widget is `':{end}'`, and the same way around when `end` isn't defined. However, when neither `start` nor `end` are defined, the searchState is an empty string.
 * @providedPropType {array.<{isRefined: boolean, label: string, value: string, isRefined: boolean, noRefinement: boolean}>} items - the list of ranges the MultiRange can display.
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
    transformItems: PropTypes.func,
  },

  getProvidedProps(props, searchState, searchResults) {
    const attributeName = props.attributeName;
    const currentRefinement = getCurrentRefinement(props, searchState);
    const items = props.items.map(item => {
      const value = stringifyItem(item);
      return {
        label: item.label,
        value,
        isRefined: value === currentRefinement,
        noRefinement: searchResults && searchResults.results ?
         itemHasRefinement(getId(props), searchResults.results, value) : false,
      };
    });

    const stats = searchResults.results && searchResults.results.getFacetByName(attributeName) ?
      searchResults.results.getFacetStats(attributeName) : null;
    const refinedItem = find(items, item => item.isRefined === true);
    if (!items.some(item => item.value === '')) {
      items.push({
        value: '',
        isRefined: isEmpty(refinedItem),
        noRefinement: !stats,
        label: 'All',
      });
    }

    return {
      items: props.transformItems ? props.transformItems(items) : items,
      currentRefinement,
      canRefine: items.length > 0 && items.some(item => item.noRefinement === false),
    };
  },

  refine(props, searchState, nextRefinement) {
    return {
      ...searchState,
      [namespace]: {...searchState[namespace], [getId(props, searchState)]: nextRefinement},
    };
  },

  cleanUp(props, searchState) {
    const cleanState = omit(searchState, `${namespace}.${getId(props)}`);
    if (isEmpty(cleanState[namespace])) {
      return omit(cleanState, namespace);
    }
    return cleanState;
  },

  getSearchParameters(searchParameters, props, searchState) {
    const {attributeName} = props;
    const {start, end} = parseItem(getCurrentRefinement(props, searchState));
    searchParameters = searchParameters.addDisjunctiveFacet(attributeName);

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

  getMetadata(props, searchState) {
    const id = getId(props);
    const value = getCurrentRefinement(props, searchState);
    const items = [];
    if (value !== '') {
      const {label} = find(props.items, item => stringifyItem(item) === value);
      items.push({
        label: `${props.attributeName}: ${label}`,
        attributeName: props.attributeName,
        currentRefinement: label,
        value: nextState => ({
          ...nextState,
          [namespace]: {...nextState[namespace], [id]: ''},
        }),
      });
    }
    return {id, items};
  },
});
