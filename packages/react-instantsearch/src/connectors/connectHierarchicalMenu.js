import {PropTypes} from 'react';
import {omit, isEmpty} from 'lodash';

import createConnector from '../core/createConnector';
import {SearchParameters} from 'algoliasearch-helper';

export const getId = props => props.attributes[0];

const namespace = 'hierarchicalMenu';

function getCurrentRefinement(props, searchState) {
  const id = getId(props);
  if (searchState[namespace] && typeof searchState[namespace][id] !== 'undefined') {
    const subState = searchState[namespace];
    if (subState[id] === '') {
      return null;
    }
    return subState[id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return null;
}

function getValue(path, props, searchState) {
  const {
    id,
    attributes,
    separator,
    rootPath,
    showParentLevel,
  } = props;

  const currentRefinement = getCurrentRefinement(props, searchState);
  let nextRefinement;

  if (currentRefinement === null) {
    nextRefinement = path;
  } else {
    const tmpSearchParameters = new SearchParameters({
      hierarchicalFacets: [{
        name: id,
        attributes,
        separator,
        rootPath,
        showParentLevel,
      }],
    });

    nextRefinement = tmpSearchParameters
      .toggleHierarchicalFacetRefinement(id, currentRefinement)
      .toggleHierarchicalFacetRefinement(id, path)
      .getHierarchicalRefinement(id)[0];
  }

  return nextRefinement;
}

function transformValue(value, limit, props, searchState) {
  return value.slice(0, limit).map(v => ({
    label: v.name,
    value: getValue(v.path, props, searchState),
    count: v.count,
    isRefined: v.isRefined,
    items: v.data && transformValue(v.data, limit, props, searchState),
  }));
}

const sortBy = ['name:asc'];

/**
 * connectHierarchicalMenu connector provides the logic to build a widget that will
 * give the user the ability to explore a tree-like structure.
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two levels deep.
 * @name connectHierarchicalMenu
 * @kind connector
 * @propType {string} attributes - List of attributes to use to generate the hierarchy of the menu. See the example for the convention to follow.
 * @propType {string} defaultRefinement - the item value selected by default
 * @propType {boolean} [showMore=false] - Flag to activate the show more button, for toggling the number of items between limitMin and limitMax.
 * @propType {number} [limitMin=10] -  The maximum number of items displayed.
 * @propType {number} [limitMax=20] -  The maximum number of items displayed when the user triggers the show more. Not considered if `showMore` is false.
 * @propType {string} [separator='>'] -  Specifies the level separator used in the data.
 * @propType {string[]} [rootPath=null] - The already selected and hidden path.
 * @propType {boolean} [showParentLevel=true] - Flag to set if the parent level should be displayed.
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{items: object, count: number, isRefined: boolean, label: string, value: string}>} items - the list of items the HierarchicalMenu can display. items has the same shape as parent items.
 */
export default createConnector({
  displayName: 'AlgoliaHierarchicalMenu',

  propTypes: {
    attributes: (props, propName, componentName) => {
      const isNotString = val => typeof val !== 'string';
      if (!Array.isArray(props[propName]) || props[propName].some(isNotString) || props[propName].length < 1) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Expected an Array of Strings`);
      }
      return undefined;
    },
    separator: PropTypes.string,
    rootPath: PropTypes.string,
    showParentLevel: PropTypes.bool,
    defaultRefinement: PropTypes.string,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    transformItems: PropTypes.func,
  },

  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
    separator: ' > ',
    rootPath: null,
    showParentLevel: true,
  },

  getProvidedProps(props, searchState, searchResults) {
    const {showMore, limitMin, limitMax} = props;
    const id = getId(props);
    const {results} = searchResults;

    const isFacetPresent =
      Boolean(results) &&
      Boolean(results.getFacetByName(id));

    if (!isFacetPresent) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(props, searchState),
        canRefine: false,
      };
    }

    const limit = showMore ? limitMax : limitMin;
    const value = results.getFacetValues(id, {sortBy});
    const items = value.data ? transformValue(value.data, limit, props, searchState) : [];

    return {
      items: props.transformItems ? props.transformItems(items) : items,
      currentRefinement: getCurrentRefinement(props, searchState),
      canRefine: items.length > 0,
    };
  },

  refine(props, searchState, nextRefinement) {
    const id = getId(props);
    return {
      ...searchState,
      [namespace]: {...searchState[namespace], [id]: nextRefinement || ''},
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
    const {
      attributes,
      separator,
      rootPath,
      showParentLevel,
      showMore,
      limitMin,
      limitMax,
    } = props;

    const id = getId(props);
    const limit = showMore ? limitMax : limitMin;

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
          limit
        ),
      });

    const currentRefinement = getCurrentRefinement(props, searchState);
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
    const currentRefinement = getCurrentRefinement(props, searchState);

    return {
      id,
      items: !currentRefinement ? [] : [{
        label: `${rootAttribute}: ${currentRefinement}`,
        attributeName: rootAttribute,
        value: nextState => ({
          ...nextState,
          [namespace]: {...nextState[namespace], [id]: ''},
        }),
        currentRefinement,
      }],
    };
  },
});
