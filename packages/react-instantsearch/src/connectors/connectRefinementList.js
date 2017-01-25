import {PropTypes} from 'react';
import {omit, isEmpty} from 'lodash';

import createConnector from '../core/createConnector';

const namespace = 'refinementList';

function getId(props) {
  return props.attributeName;
}

function getCurrentRefinement(props, searchState) {
  const id = getId(props);
  if (searchState[namespace] && typeof searchState[namespace][id] !== 'undefined') {
    const subState = searchState[namespace];
    if (typeof subState[id] === 'string') {
      // All items were unselected
      if (subState[id] === '') {
        return [];
      }

      // Only one item was in the searchState but we know it should be an array
      return [subState[id]];
    }
    return subState[id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return [];
}

function getValue(name, props, searchState) {
  const currentRefinement = getCurrentRefinement(props, searchState);
  const isAnewValue = currentRefinement.indexOf(name) === -1;
  const nextRefinement = isAnewValue ?
    currentRefinement.concat([name]) : // cannot use .push(), it mutates
    currentRefinement.filter(selectedValue => selectedValue !== name); // cannot use .splice(), it mutates
  return nextRefinement;
}

/**
 * connectRefinementList connector provides the logic to build a widget that will
 * give the user tha ability to choose multiple values for a specific facet.
 * @name connectRefinementList
 * @kind connector
 * @propType {string} [operator=or] - How to apply the refinements. Possible values: 'or' or 'and'.
 * @propType {string} attributeName - the name of the attribute in the record
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limitMin=10] - the minimum number of displayed items
 * @propType {number} [limitMax=20] - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string[]} defaultRefinement - the values of the items selected by default. The searchState of this widget takes the form of a list of `string`s, which correspond to the values of all selected refinements. However, when there are no refinements selected, the value of the searchState is an empty string.
 * @propType {boolean} [searchForFacetValues=false] - if set to true, the searchForFacetValues function is provided
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {function} searchForFacetValues - a function to toggle a search for facet values
 * @providedPropType {string[]} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{count: number, isRefined: boolean, label: string, value: string}>} items - the list of items the RefinementList can display.
 * @providedPropType {boolean} isFromSearch - a boolean that says if the `items` props contains facet values from the global search or from the search for facet values results.
 */

const sortBy = ['isRefined', 'count:desc', 'name:asc'];
export default createConnector({
  displayName: 'AlgoliaRefinementList',

  propTypes: {
    id: PropTypes.string,
    attributeName: PropTypes.string.isRequired,
    operator: PropTypes.oneOf(['and', 'or']),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    defaultRefinement: PropTypes.arrayOf(PropTypes.string),
    searchForFacetValues: PropTypes.bool,
    transformItems: PropTypes.func,
  },

  defaultProps: {
    operator: 'or',
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  },

  getProvidedProps(props, searchState, searchResults, metadata, searchForFacetValuesResults) {
    const {results} = searchResults;
    const {attributeName, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    const canRefine =
      Boolean(results) &&
      Boolean(results.getFacetByName(attributeName));

    const isFromSearch = Boolean(searchForFacetValuesResults
      && searchForFacetValuesResults[attributeName]
      && searchForFacetValuesResults.query !== '');
    const searchForFacetValues = props.searchForFacetValues ? this.searchForFacetValues : undefined;

    if (!canRefine) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(props, searchState),
        canRefine,
        isFromSearch,
        searchForFacetValues,
      };
    }

    const items = isFromSearch
      ? searchForFacetValuesResults[attributeName]
        .map(v => ({
          label: v.value,
          value: getValue(v.value, props, searchState),
          _highlightResult: {label: {value: v.highlighted}},
          count: v.count,
          isRefined: v.isRefined,
        }))
      : results
        .getFacetValues(attributeName, {sortBy})
        .map(v => ({
          label: v.name,
          value: getValue(v.name, props, searchState),
          count: v.count,
          isRefined: v.isRefined,
        }));

    const transformedItems = props.transformItems ? props.transformItems(items) : items;

    return {
      items: transformedItems.slice(0, limit),
      currentRefinement: getCurrentRefinement(props, searchState),
      isFromSearch,
      searchForFacetValues,
      canRefine: items.length > 0,
    };
  },

  refine(props, searchState, nextRefinement) {
    const id = getId(props);
    return {
      ...searchState,
      // Setting the value to an empty string ensures that it is persisted in
      // the URL as an empty value.
      // This is necessary in the case where `defaultRefinement` contains one
      // item and we try to deselect it. `nextSelected` would be an empty array,
      // which would not be persisted to the URL.
      // {foo: ['bar']} => "foo[0]=bar"
      // {foo: []} => ""
      [namespace]: {...searchState[namespace], [id]: nextRefinement.length > 0 ? nextRefinement : ''},
    };
  },

  searchForFacetValues(props, searchState, nextRefinement) {
    return {facetName: props.attributeName, query: nextRefinement};
  },

  cleanUp(props, searchState) {
    const cleanState = omit(searchState, `${namespace}.${getId(props)}`);
    if (isEmpty(cleanState[namespace])) {
      return omit(cleanState, namespace);
    }
    return cleanState;
  },

  getSearchParameters(searchParameters, props, searchState) {
    const {attributeName, operator, showMore, limitMin, limitMax} = props;
    const limit = showMore ? limitMax : limitMin;

    const addKey = operator === 'and' ?
      'addFacet' : 'addDisjunctiveFacet';
    const addRefinementKey = `${addKey}Refinement`;

    searchParameters = searchParameters.setQueryParameters({
      maxValuesPerFacet: Math.max(
        searchParameters.maxValuesPerFacet || 0,
        limit
      ),
    });

    searchParameters = searchParameters[addKey](attributeName);

    return getCurrentRefinement(props, searchState).reduce((res, val) =>
        res[addRefinementKey](attributeName, val)
      , searchParameters);
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    return {
      id,
      items: getCurrentRefinement(props, searchState).length > 0 ? [{
        attributeName: props.attributeName,
        label: `${props.attributeName}: `,
        currentRefinement: getCurrentRefinement(props, searchState),
        value: nextState => ({
          ...nextState,
          [namespace]: {...nextState[namespace], [id]: ''},
        }),
        items: getCurrentRefinement(props, searchState).map(item => ({
          label: `${item}`,
          value: nextState => {
            const nextSelectedItems = getCurrentRefinement(props, nextState).filter(
                other => other !== item
              );

            return {
              ...nextState,
              [namespace]: {...nextState[namespace], [id]: nextSelectedItems.length > 0 ? nextSelectedItems : ''},
            };
          },
        })),
      }] : [],
    };
  },
});
