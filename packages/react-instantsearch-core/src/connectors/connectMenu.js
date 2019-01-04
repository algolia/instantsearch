import { orderBy } from 'lodash';
import PropTypes from 'prop-types';
import createConnector from '../core/createConnector';
import {
  getIndexId,
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';

const namespace = 'menu';

function getId(props) {
  return props.attribute;
}

function getCurrentRefinement(props, searchState, context) {
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    `${namespace}.${getId(props)}`,
    null,
    currentRefinement => {
      if (currentRefinement === '') {
        return null;
      }
      return currentRefinement;
    }
  );
}

function getValue(name, props, searchState, context) {
  const currentRefinement = getCurrentRefinement(props, searchState, context);
  return name === currentRefinement ? '' : name;
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

const sortBy = ['count:desc', 'name:asc'];

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

  propTypes: {
    attribute: PropTypes.string.isRequired,
    showMore: PropTypes.bool,
    limit: PropTypes.number,
    showMoreLimit: PropTypes.number,
    defaultRefinement: PropTypes.string,
    transformItems: PropTypes.func,
    searchable: PropTypes.bool,
  },

  defaultProps: {
    showMore: false,
    limit: 10,
    showMoreLimit: 20,
  },

  getProvidedProps(
    props,
    searchState,
    searchResults,
    meta,
    searchForFacetValuesResults
  ) {
    const { attribute, searchable } = props;
    const results = getResults(searchResults, this.context);

    const canRefine =
      Boolean(results) && Boolean(results.getFacetByName(attribute));

    const isFromSearch = Boolean(
      searchForFacetValuesResults &&
        searchForFacetValuesResults[attribute] &&
        searchForFacetValuesResults.query !== ''
    );

    // Search For Facet Values is not available with derived helper (used for multi index search)
    if (searchable && this.context.multiIndexContext) {
      throw new Error(
        'react-instantsearch: searching in *List is not available when used inside a' +
          ' multi index context'
      );
    }

    if (!canRefine) {
      return {
        items: [],
        currentRefinement: getCurrentRefinement(
          props,
          searchState,
          this.context
        ),
        isFromSearch,
        searchable,
        canRefine,
      };
    }

    const items = isFromSearch
      ? searchForFacetValuesResults[attribute].map(v => ({
          label: v.value,
          value: getValue(v.value, props, searchState, this.context),
          _highlightResult: { label: { value: v.highlighted } },
          count: v.count,
          isRefined: v.isRefined,
        }))
      : results.getFacetValues(attribute, { sortBy }).map(v => ({
          label: v.name,
          value: getValue(v.name, props, searchState, this.context),
          count: v.count,
          isRefined: v.isRefined,
        }));

    const sortedItems =
      searchable && !isFromSearch
        ? orderBy(
            items,
            ['isRefined', 'count', 'label'],
            ['desc', 'desc', 'asc']
          )
        : items;

    const transformedItems = props.transformItems
      ? props.transformItems(sortedItems)
      : sortedItems;

    return {
      items: transformedItems.slice(0, getLimit(props)),
      currentRefinement: getCurrentRefinement(props, searchState, this.context),
      isFromSearch,
      searchable,
      canRefine: transformedItems.length > 0,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, this.context);
  },

  searchForFacetValues(props, searchState, nextRefinement) {
    return {
      facetName: props.attribute,
      query: nextRefinement,
      maxFacetHits: getLimit(props),
    };
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, this.context);
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

    const currentRefinement = getCurrentRefinement(
      props,
      searchState,
      this.context
    );
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
    const currentRefinement = getCurrentRefinement(
      props,
      searchState,
      this.context
    );
    return {
      id,
      index: getIndexId(this.context),
      items:
        currentRefinement === null
          ? []
          : [
              {
                label: `${props.attribute}: ${currentRefinement}`,
                attribute: props.attribute,
                value: nextState => refine(props, nextState, '', this.context),
                currentRefinement,
              },
            ],
    };
  },
});
