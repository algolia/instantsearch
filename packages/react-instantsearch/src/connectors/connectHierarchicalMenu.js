import {PropTypes} from 'react';
import {omit, isEmpty} from 'lodash';

import createConnector from '../core/createConnector';
import {SearchParameters} from 'algoliasearch-helper';

export const getId = props => props.attributes[0];

const namespace = 'hierarchicalMenu';

function getCurrentRefinement(props, state) {
  const id = getId(props);
  if (state[namespace] && typeof state[namespace][id] !== 'undefined') {
    const subState = state[namespace];
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

function getValue(path, props, state) {
  const {
    id,
    attributes,
    separator,
    rootPath,
    showParentLevel,
  } = props;

  const currentRefinement = getCurrentRefinement(props, state);
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

function transformValue(value, limit, props, state) {
  const limitValue = value.slice(0, limit);
  return limitValue.map(v => ({
    label: v.name,
    value: getValue(v.path, props, state),
    count: v.count,
    isRefined: v.isRefined,
    items: v.data && transformValue(v.data, limit, props, state),
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
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
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
  },

  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
    separator: ' > ',
    rootPath: null,
    showParentLevel: true,
  },

  getProps(props, state, search) {
    const {showMore, limitMin, limitMax} = props;
    const id = getId(props);
    const {results} = search;

    const isFacetPresent =
      Boolean(results) &&
      Boolean(results.getFacetByName(id));

    if (!isFacetPresent) {
      return null;
    }

    const limit = showMore ? limitMax : limitMin;
    const value = results.getFacetValues(id, {sortBy});
    return {
      items: value.data ? transformValue(value.data, limit, props, state) : [],
      currentRefinement: getCurrentRefinement(props, state),
    };
  },

  refine(props, state, nextRefinement) {
    const id = getId(props);
    return {
      ...state,
      [namespace]: {[id]: nextRefinement || ''},
    };
  },

  cleanUp(props, state) {
    const cleanState = omit(state, `${namespace}.${getId(props)}`);
    if (isEmpty(cleanState[namespace])) {
      return omit(cleanState, namespace);
    }
    return cleanState;
  },

  getSearchParameters(searchParameters, props, state) {
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

    const currentRefinement = getCurrentRefinement(props, state);
    if (currentRefinement !== null) {
      searchParameters = searchParameters.toggleHierarchicalFacetRefinement(
        id,
        currentRefinement
      );
    }

    return searchParameters;
  },

  getMetadata(props, state) {
    const rootAttribute = props.attributes[0];
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, state);

    return {
      id,
      items: !currentRefinement ? [] : [{
        label: `${rootAttribute}: ${currentRefinement}`,
        attributeName: rootAttribute,
        value: nextState => ({
          ...nextState,
          [namespace]: {[id]: ''},
        }),
        currentRefinement,
      }],
    };
  },
});
