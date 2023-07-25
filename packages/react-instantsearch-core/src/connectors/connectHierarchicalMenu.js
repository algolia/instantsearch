import algoliasearchHelper from 'algoliasearch-helper';
import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
import {
  cleanUpValue,
  getIndexId,
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';
import { unescapeFacetValue } from '../core/utils';

export const getId = (props) => props.attributes[0];

const namespace = 'hierarchicalMenu';

function getCurrentRefinement(props, searchState, context) {
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    `${namespace}.${getId(props)}`,
    null
  );

  if (currentRefinement === '') {
    return null;
  }
  return currentRefinement;
}

function getValue(value, props, searchState, context) {
  const { id, attributes, separator, rootPath, showParentLevel } = props;

  const currentRefinement = getCurrentRefinement(props, searchState, context);
  let nextRefinement;

  if (currentRefinement === null) {
    nextRefinement = value;
  } else {
    const tmpSearchParameters = new algoliasearchHelper.SearchParameters({
      hierarchicalFacets: [
        {
          name: id,
          attributes,
          separator,
          rootPath,
          showParentLevel,
        },
      ],
    });

    nextRefinement = tmpSearchParameters
      .toggleHierarchicalFacetRefinement(id, currentRefinement)
      .toggleHierarchicalFacetRefinement(id, value)
      .getHierarchicalRefinement(id)[0];
  }

  return nextRefinement;
}

function transformValue(value, props, searchState, context) {
  return value.map((v) => ({
    label: v.name,
    value: getValue(v.escapedValue, props, searchState, context),
    count: v.count,
    isRefined: v.isRefined,
    items: v.data && transformValue(v.data, props, searchState, context),
  }));
}

const truncate = (items = [], limit = 10) =>
  items.slice(0, limit).map((item = {}) =>
    Array.isArray(item.items)
      ? {
          ...item,
          items: truncate(item.items, limit),
        }
      : item
  );

function refine(props, searchState, nextRefinement, context) {
  const id = getId(props);
  const nextValue = { [id]: nextRefinement || '' };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage, namespace);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, `${namespace}.${getId(props)}`);
}

const sortBy = ['name:asc'];

/**
 * connectHierarchicalMenu connector provides the logic to build a widget that will
 * give the user the ability to explore a tree-like structure.
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two levels deep.
 * @name connectHierarchicalMenu
 * @requirements To use this widget, your attributes must be formatted in a specific way.
 * If you want for example to have a hierarchical menu of categories, objects in your index
 * should be formatted this way:
 *
 * ```json
 * {
 *   "categories.lvl0": "products",
 *   "categories.lvl1": "products > fruits",
 *   "categories.lvl2": "products > fruits > citrus"
 * }
 * ```
 *
 * It's also possible to provide more than one path for each level:
 *
 * ```json
 * {
 *   "categories.lvl0": ["products", "goods"],
 *   "categories.lvl1": ["products > fruits", "goods > to eat"]
 * }
 * ```
 *
 * All attributes passed to the `attributes` prop must be present in "attributes for faceting"
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 *
 * @kind connector
 * @propType {array.<string>} attributes - List of attributes to use to generate the hierarchy of the menu. See the example for the convention to follow.
 * @propType {string} [defaultRefinement] - the item value selected by default
 * @propType {boolean} [showMore=false] - Flag to activate the show more button, for toggling the number of items between limit and showMoreLimit.
 * @propType {number} [limit=10] -  The maximum number of items displayed.
 * @propType {number} [showMoreLimit=20] -  The maximum number of items displayed when the user triggers the show more. Not considered if `showMore` is false.
 * @propType {string} [separator='>'] -  Specifies the level separator used in the data.
 * @propType {string} [rootPath=null] - The path to use if the first level is not the root level.
 * @propType {boolean} [showParentLevel=true] - Flag to set if the parent level should be displayed.
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{items: object, count: number, isRefined: boolean, label: string, value: string}>} items - the list of items the HierarchicalMenu can display. items has the same shape as parent items.
 */
export default createConnector({
  displayName: 'AlgoliaHierarchicalMenu',
  $$type: 'ais.hierarchicalMenu',

  propTypes: {
    attributes: (props, propName, componentName) => {
      const isNotString = (val) => typeof val !== 'string';
      if (
        !Array.isArray(props[propName]) ||
        props[propName].some(isNotString) ||
        props[propName].length < 1
      ) {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. Expected an Array of Strings`
        );
      }
      return undefined;
    },
    separator: PropTypes.string,
    rootPath: PropTypes.string,
    showParentLevel: PropTypes.bool,
    defaultRefinement: PropTypes.string,
    showMore: PropTypes.bool,
    limit: PropTypes.number,
    showMoreLimit: PropTypes.number,
    transformItems: PropTypes.func,
    facetOrdering: PropTypes.bool,
  },

  defaultProps: {
    showMore: false,
    limit: 10,
    showMoreLimit: 20,
    separator: ' > ',
    rootPath: null,
    showParentLevel: true,
    facetOrdering: true,
  },

  getProvidedProps(props, searchState, searchResults) {
    const { showMore, limit, showMoreLimit, facetOrdering } = props;
    const id = getId(props);

    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    const isFacetPresent =
      Boolean(results) && Boolean(results.getFacetByName(id));

    if (!isFacetPresent) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(props, searchState, {
          ais: props.contextValue,
          multiIndexContext: props.indexContextValue,
        }),
        canRefine: false,
      };
    }
    const itemsLimit = showMore ? showMoreLimit : limit;
    const value = results.getFacetValues(id, { sortBy, facetOrdering });
    const items = value.data
      ? transformValue(value.data, props, searchState, {
          ais: props.contextValue,
          multiIndexContext: props.indexContextValue,
        })
      : [];
    const transformedItems = props.transformItems
      ? props.transformItems(items)
      : items;
    return {
      items: truncate(transformedItems, itemsLimit),
      currentRefinement: getCurrentRefinement(props, searchState, {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      canRefine: transformedItems.length > 0,
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
    const {
      attributes,
      separator,
      rootPath,
      showParentLevel,
      showMore,
      limit,
      showMoreLimit,
      contextValue,
    } = props;

    const id = getId(props);
    const itemsLimit = showMore ? showMoreLimit : limit;

    searchParameters = searchParameters
      .addHierarchicalFacet({
        name: id,
        attributes,
        separator,
        rootPath,
        showParentLevel,
      })
      .setQueryParameters({
        maxValuesPerFacet: Math.max(
          searchParameters.maxValuesPerFacet || 0,
          itemsLimit
        ),
      });

    const currentRefinement = getCurrentRefinement(props, searchState, {
      ais: contextValue,
      multiIndexContext: props.indexContextValue,
    });
    if (currentRefinement !== null) {
      searchParameters = searchParameters.toggleHierarchicalFacetRefinement(
        id,
        currentRefinement
      );
    }

    return searchParameters;
  },

  getMetadata(props, searchState) {
    const rootAttribute = props.attributes[0];
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    const items = !currentRefinement
      ? []
      : [
          {
            label: `${rootAttribute}: ${unescapeFacetValue(currentRefinement)}`,
            attribute: rootAttribute,
            value: (nextState) =>
              refine(props, nextState, '', {
                ais: props.contextValue,
                multiIndexContext: props.indexContextValue,
              }),
            currentRefinement,
          },
        ];

    return {
      id,
      index: getIndexId({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      items,
    };
  },
});
