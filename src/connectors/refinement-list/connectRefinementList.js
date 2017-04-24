import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customRefinementList = connectRefinementList(function render(params) {
  // params = {
  //   isFromSearch,
  //   createURL,
  //   items,
  //   refine,
  //   searchForItems,
  //   instantSearchInstance,
  //   canRefine,
  //   widgetParams,
  // }
});
search.addWidget(
  customRefinementList({
    attributeName,
    [ operator = 'or' ],
    [ limit ],
    [ sortBy = ['isRefined', 'count:desc'] ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectRefinementList.html
`;

export const checkUsage = ({attributeName, operator, usageMessage}) => {
  const noAttributeName = attributeName === undefined;
  const invalidOperator = !(/^(and|or)$/).test(operator);

  if (noAttributeName || invalidOperator) {
    throw new Error(usageMessage);
  }
};

/**
 * @typedef {Object} RefinementListRenderingOptions
 * @property {string} attributeName the attribute in the records that are used by the widget
 * @property {string} operator how the filters are combined together
 * @property {number} limit the max number of items displayed
 * @property {string[]|function} [sortBy = ['isRefined', 'count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 */

/**
 * @typedef {Object} RefinementListRenderingOptions
 * @property {Object[]} items the list of filtering values returned from Algolia
 * @property {function} createURL create the next state url
 * @property {function} refine set the next state url
 * @property {function} searchForItems search for values inside the list
 * @property {boolean} isFromSearch indicates if the values are from an index search
 * @property {boolean} canRefine indicates if a refinement can be applied
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 */

/**
 * Creates a custom widget for a refinement list.
 * @type {Connector}
 * @param {function(RefinementListRenderingOptions, boolean)} renderFn function that renders the refinement list widget
 * @returns {function(RefinementListWidgetOptions)} a custom refinement list widget factory
 */
export default function connectRefinementList(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      operator = 'or',
      limit,
      sortBy = ['isRefined', 'count:desc'],
    } = widgetParams;

    checkUsage({attributeName, operator, usage});

    const formatItems = ({name: label, ...item}) =>
      ({...item, label, value: label, highlighted: label});

    const render = ({items, state, createURL,
                    helperSpecializedSearchFacetValues,
                    refine, isFromSearch, isFirstSearch, instantSearchInstance}) => {
      // Compute a specific createURL method able to link to any facet value state change
      const _createURL = facetValue => createURL(state.toggleRefinement(attributeName, facetValue));

      // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
      // function
      const searchFacetValues = helperSpecializedSearchFacetValues &&
        helperSpecializedSearchFacetValues(
          state,
          createURL,
          helperSpecializedSearchFacetValues,
          refine,
          instantSearchInstance,
        );

      renderFn({
        createURL: _createURL,
        items,
        refine,
        searchForItems: searchFacetValues,
        instantSearchInstance,
        isFromSearch,
        canRefine: isFromSearch || items.length > 0,
        widgetParams,
      }, isFirstSearch);
    };

    let lastResultsFromMainSearch;
    let searchForFacetValues;
    let refine;

    const createSearchForFacetValues = helper =>
      (state, createURL, helperSpecializedSearchFacetValues, toggleRefinement, instantSearchInstance) =>
      query => {
        if (query === '' && lastResultsFromMainSearch) {
          // render with previous data from the helper.
          render({
            items: lastResultsFromMainSearch,
            state,
            createURL,
            helperSpecializedSearchFacetValues,
            refine: toggleRefinement,
            isFromSearch: false,
            isFirstSearch: false,
            instantSearchInstance,
          });
        } else {
          helper.searchForFacetValues(attributeName, query).then(results => {
            const facetValues = results.facetHits.map(formatItems);

            render({
              items: facetValues,
              state,
              createURL,
              helperSpecializedSearchFacetValues,
              refine: toggleRefinement,
              isFromSearch: true,
              isFirstSearch: false,
              instantSearchInstance,
            });
          });
        }
      };

    return {
      getConfiguration: (configuration = {}) => {
        const widgetConfiguration = {
          [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [attributeName],
        };

        if (limit !== undefined) {
          const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
          widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit);
        }

        return widgetConfiguration;
      },
      init({helper, createURL, instantSearchInstance}) {
        refine = facetValue => helper
          .toggleRefinement(attributeName, facetValue)
          .search();

        searchForFacetValues = createSearchForFacetValues(helper);

        render({
          items: [],
          state: helper.state,
          createURL,
          helperSpecializedSearchFacetValues: searchForFacetValues,
          refine,
          isFromSearch: false,
          isFirstSearch: true,
          instantSearchInstance,
        });
      },
      render({results, state, createURL, instantSearchInstance}) {
        const items = results
          .getFacetValues(attributeName, {sortBy})
          .map(formatItems);

        lastResultsFromMainSearch = items;

        render({
          items,
          state,
          createURL,
          helperSpecializedSearchFacetValues: searchForFacetValues,
          refine,
          isFromSearch: false,
          isFirstSearch: false,
          instantSearchInstance,
        });
      },
    };
  };
}
