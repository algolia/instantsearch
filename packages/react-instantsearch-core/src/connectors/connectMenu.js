import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
import {
  getIndexId,
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';
import { unescapeFacetValue } from '../core/utils';

const namespace = 'menu';

function getId(props) {
  return props.attribute;
}

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
  const currentRefinement = getCurrentRefinement(props, searchState, context);
  return value === currentRefinement ? '' : value;
}

function getLimit({ showMore, limit, showMoreLimit }) {
  return showMore ? showMoreLimit : limit;
}

function refine(props, searchState, nextRefinement, context) {
  const id = getId(props);
  const nextValue = { [id]: nextRefinement ? nextRefinement : '' };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage, namespace);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, `${namespace}.${getId(props)}`);
}

const defaultSortBy = ['count:desc', 'name:asc'];

/**
 * connectMenu connector provides the logic to build a widget that will
 * give the user the ability to choose a single value for a specific facet.
 * @name connectMenu
 * @requirements The attribute passed to the `attribute` prop must be present in "attributes for faceting"
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 * @kind connector
 * @propType {string} attribute - the name of the attribute in the record
 * @propType {boolean} [showMore=false] - true if the component should display a button that will expand the number of items
 * @propType {number} [limit=10] - the minimum number of diplayed items
 * @propType {number} [showMoreLimit=20] - the maximun number of displayed items. Only used when showMore is set to `true`
 * @propType {string} [defaultRefinement] - the value of the item selected by default
 * @propType {boolean} [searchable=false] - allow search inside values
 * @providedPropType {function} refine - a function to toggle a refinement
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{count: number, isRefined: boolean, label: string, value: string}>} items - the list of items the Menu can display.
 * @providedPropType {function} searchForItems - a function to toggle a search inside items values
 * @providedPropType {boolean} isFromSearch - a boolean that says if the `items` props contains facet values from the global search or from the search inside items.
 */
export default createConnector({
  displayName: 'AlgoliaMenu',
  $$type: 'ais.menu',

  propTypes: {
    attribute: PropTypes.string.isRequired,
    showMore: PropTypes.bool,
    limit: PropTypes.number,
    showMoreLimit: PropTypes.number,
    defaultRefinement: PropTypes.string,
    transformItems: PropTypes.func,
    searchable: PropTypes.bool,
    facetOrdering: PropTypes.bool,
  },

  defaultProps: {
    showMore: false,
    limit: 10,
    showMoreLimit: 20,
    facetOrdering: true,
  },

  getProvidedProps(
    props,
    searchState,
    searchResults,
    meta,
    searchForFacetValuesResults
  ) {
    const { attribute, searchable, indexContextValue, facetOrdering } = props;
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    const canRefine =
      Boolean(results) && Boolean(results.getFacetByName(attribute));

    const isFromSearch = Boolean(
      searchForFacetValuesResults &&
        searchForFacetValuesResults[attribute] &&
        searchForFacetValuesResults.query !== ''
    );

    // Search For Facet Values is not available with derived helper (used for multi index search)
    if (searchable && indexContextValue) {
      throw new Error(
        'react-instantsearch: searching in *List is not available when used inside a' +
          ' multi index context'
      );
    }

    if (!canRefine) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(props, searchState, {
          ais: props.contextValue,
          multiIndexContext: props.indexContextValue,
        }),
        isFromSearch,
        searchable,
        canRefine,
      };
    }

    let items;
    if (isFromSearch) {
      items = searchForFacetValuesResults[attribute].map((v) => ({
        label: v.value,
        value: getValue(v.escapedValue, props, searchState, {
          ais: props.contextValue,
          multiIndexContext: props.indexContextValue,
        }),
        _highlightResult: { label: { value: v.highlighted } },
        count: v.count,
        isRefined: v.isRefined,
      }));
    } else {
      items = results
        .getFacetValues(attribute, {
          sortBy: searchable ? undefined : defaultSortBy,
          facetOrdering,
        })
        .map((v) => ({
          label: v.name,
          value: getValue(v.escapedValue, props, searchState, {
            ais: props.contextValue,
            multiIndexContext: props.indexContextValue,
          }),
          count: v.count,
          isRefined: v.isRefined,
        }));
    }

    const transformedItems = props.transformItems
      ? props.transformItems(items)
      : items;

    return {
      items: transformedItems.slice(0, getLimit(props)),
      currentRefinement: getCurrentRefinement(props, searchState, {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      isFromSearch,
      searchable,
      canRefine: transformedItems.length > 0,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  searchForFacetValues(props, searchState, nextRefinement) {
    return {
      facetName: props.attribute,
      query: nextRefinement,
      maxFacetHits: getLimit(props),
    };
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  getSearchParameters(searchParameters, props, searchState) {
    const { attribute } = props;

    searchParameters = searchParameters.setQueryParameters({
      maxValuesPerFacet: Math.max(
        searchParameters.maxValuesPerFacet || 0,
        getLimit(props)
      ),
    });

    searchParameters = searchParameters.addDisjunctiveFacet(attribute);

    const currentRefinement = getCurrentRefinement(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    if (currentRefinement !== null) {
      searchParameters = searchParameters.addDisjunctiveFacetRefinement(
        attribute,
        currentRefinement
      );
    }

    return searchParameters;
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    return {
      id,
      index: getIndexId({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      items:
        currentRefinement === null
          ? []
          : [
              {
                label: `${props.attribute}: ${unescapeFacetValue(
                  currentRefinement
                )}`,
                attribute: props.attribute,
                value: (nextState) =>
                  refine(props, nextState, '', {
                    ais: props.contextValue,
                    multiIndexContext: props.indexContextValue,
                  }),
                currentRefinement,
              },
            ],
    };
  },
});
