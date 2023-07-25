import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
import {
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getResults,
  getIndexId,
} from '../core/indexUtils';
import { find } from '../core/utils';

function stringifyItem(item) {
  if (typeof item.start === 'undefined' && typeof item.end === 'undefined') {
    return '';
  }
  const start = typeof item.start !== 'undefined' ? item.start : '';
  const end = typeof item.end !== 'undefined' ? item.end : '';
  return `${start}:${end}`;
}

function parseItem(value) {
  if (value.length === 0) {
    return { start: null, end: null };
  }
  const [startStr, endStr] = value.split(':');
  return {
    start: startStr.length > 0 ? parseFloat(startStr) : null,
    end: endStr.length > 0 ? parseFloat(endStr) : null,
  };
}

const namespace = 'multiRange';

function getId(props) {
  return props.attribute;
}

function getCurrentRefinement(props, searchState, context) {
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    `${namespace}.${getId(props)}`,
    '',
    (currentRefinement) => {
      if (currentRefinement === '') {
        return '';
      }
      return currentRefinement;
    }
  );
}

function isRefinementsRangeIncludesInsideItemRange(stats, start, end) {
  return (
    (stats.min >= start && stats.min <= end) ||
    (stats.max >= start && stats.max <= end)
  );
}

function isItemRangeIncludedInsideRefinementsRange(stats, start, end) {
  return (
    (start >= stats.min && start <= stats.max) ||
    (end >= stats.min && end <= stats.max)
  );
}

function itemHasRefinement(attribute, results, value) {
  const stats = results.getFacetByName(attribute)
    ? results.getFacetStats(attribute)
    : null;
  const range = value.split(':');
  const start =
    Number(range[0]) === 0 || value === ''
      ? Number.NEGATIVE_INFINITY
      : Number(range[0]);
  const end =
    Number(range[1]) === 0 || value === ''
      ? Number.POSITIVE_INFINITY
      : Number(range[1]);
  return !(
    Boolean(stats) &&
    (isRefinementsRangeIncludesInsideItemRange(stats, start, end) ||
      isItemRangeIncludedInsideRefinementsRange(stats, start, end))
  );
}

function refine(props, searchState, nextRefinement, context) {
  const nextValue = { [getId(props, searchState)]: nextRefinement };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage, namespace);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, `${namespace}.${getId(props)}`);
}

/**
 * connectNumericMenu connector provides the logic to build a widget that will
 * give the user the ability to select a range value for a numeric attribute.
 * Ranges are defined statically.
 * @name connectNumericMenu
 * @requirements The attribute passed to the `attribute` prop must be holding numerical values.
 * @kind connector
 * @propType {string} attribute - the name of the attribute in the records
 * @propType {{label: string, start: number, end: number}[]} items - List of options. With a text label, and upper and lower bounds.
 * @propType {string} [defaultRefinement] - the value of the item selected by default, follow the shape of a `string` with a pattern of `'{start}:{end}'`.
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied.  follow the shape of a `string` with a pattern of `'{start}:{end}'` which corresponds to the current selected item. For instance, when the selected item is `{start: 10, end: 20}`, the searchState of the widget is `'10:20'`. When `start` isn't defined, the searchState of the widget is `':{end}'`, and the same way around when `end` isn't defined. However, when neither `start` nor `end` are defined, the searchState is an empty string.
 * @providedPropType {array.<{isRefined: boolean, label: string, value: string, isRefined: boolean, noRefinement: boolean}>} items - the list of ranges the NumericMenu can display.
 */
export default createConnector({
  displayName: 'AlgoliaNumericMenu',
  $$type: 'ais.numericMenu',

  propTypes: {
    id: PropTypes.string,
    attribute: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.node,
        start: PropTypes.number,
        end: PropTypes.number,
      })
    ).isRequired,
    transformItems: PropTypes.func,
  },

  getProvidedProps(props, searchState, searchResults) {
    const attribute = props.attribute;
    const currentRefinement = getCurrentRefinement(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    const items = props.items.map((item) => {
      const value = stringifyItem(item);
      return {
        label: item.label,
        value,
        isRefined: value === currentRefinement,
        noRefinement: results
          ? itemHasRefinement(getId(props), results, value)
          : false,
      };
    });

    const stats =
      results && results.getFacetByName(attribute)
        ? results.getFacetStats(attribute)
        : null;
    const refinedItem = find(items, (item) => item.isRefined === true);
    if (!items.some((item) => item.value === '')) {
      items.push({
        value: '',
        isRefined: refinedItem === undefined,
        noRefinement: !stats,
        label: 'All',
      });
    }

    const transformedItems = props.transformItems
      ? props.transformItems(items)
      : items;

    return {
      items: transformedItems,
      currentRefinement,
      canRefine:
        transformedItems.length > 0 &&
        transformedItems.some((item) => item.noRefinement === false),
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  getSearchParameters(searchParameters, props, searchState) {
    const { attribute } = props;
    const { start, end } = parseItem(
      getCurrentRefinement(props, searchState, {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      })
    );
    searchParameters = searchParameters.addDisjunctiveFacet(attribute);

    if (typeof start === 'number') {
      searchParameters = searchParameters.addNumericRefinement(
        attribute,
        '>=',
        start
      );
    }
    if (typeof end === 'number') {
      searchParameters = searchParameters.addNumericRefinement(
        attribute,
        '<=',
        end
      );
    }
    return searchParameters;
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const value = getCurrentRefinement(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    const items = [];
    const index = getIndexId({
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    if (value !== '') {
      const { label } = find(
        props.items,
        (item) => stringifyItem(item) === value
      );
      items.push({
        label: `${props.attribute}: ${label}`,
        attribute: props.attribute,
        currentRefinement: label,
        value: (nextState) =>
          refine(props, nextState, '', {
            ais: props.contextValue,
            multiIndexContext: props.indexContextValue,
          }),
      });
    }
    return { id, index, items };
  },
});
