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
    [ sortBy = ['isRefined', 'count:desc', 'name:asc']],
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
 * @typedef {Object} RefinementListItem
 * @property {string} value The value of the refinement list item.
 * @property {string} label Human-readable value of the refinement list item.
 * @property {number} count Number of matched results after refinement is applied.
 * @property {boolean} isRefined Indicates if the list item is refined.
 */

/**
 * @typedef {Object} CustomRefinementListWidgetOptions
 * @property {string} attributeName The name of the attribute in the records.
 * @property {"and"|"or"} [operator = 'or'] How the filters are combined together.
 * @property {number} [limit = undefined] The max number of items to display.
 * @property {string[]|function} [sortBy = ['isRefined', 'count:desc', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 */

/**
 * @typedef {Object} RefinementListRenderingOptions
 * @property {RefinementListItem[]} items The list of filtering values returned from Algolia API.
 * @property {function(item.value): string} createURL Creates the next state url for a selected refinement.
 * @property {function(item.value)} refine Action to apply selected refinements.
 * @property {function} searchForItems Searches for values inside the list.
 * @property {boolean} isFromSearch `true` if the values are from an index search.
 * @property {boolean} canRefine `true` if a refinement can be applied.
 * @property {Object} widgetParams All original `CustomRefinementListWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **RefinementList** connector provides the logic to build a custom widget that will let the
 * user filter the results based on the values of a specific facet.
 *
 * The connector provides to the rendering: `refine()` to select a value and
 * `items` that are the values that can be selected.
 * @type {Connector}
 * @param {function(RefinementListRenderingOptions, boolean)} renderFn Rendering function for the custom **RefinementList** widget.
 * @return {function(CustomRefinementListWidgetOptions)} Re-usable widget factory for a custom **RefinementList** widget.
 * @example
 * // custom `renderFn` to render the custom RefinementList widget
 * function renderFn(RefinementListRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     RefinementListRenderingOptions.widgetParams.containerNode
 *       .html('<ul></ul>')
 *   }
 *
 *     RefinementListRenderingOptions.widgetParams.containerNode
 *       .find('li[data-refine-value]')
 *       .each(function() { $(this).off('click'); });
 *
 *   if (RefinementListRenderingOptions.canRefine) {
 *     var list = RefinementListRenderingOptions.items.map(function(item) {
 *       return '<li data-refine-value="' + item.value + '">' +
 *         '<input type="checkbox" value="' + item.value + '"' + item.isRefined ? ' checked' : '' + '/>' +
 *         '<a href="' + RefinementListRenderingOptions.createURL(item.value) + '">' + item.label + '</a>' +
 *         '</li>';
 *     });
 *
 *     RefinementListRenderingOptions.widgetParams.containerNode.find('ul').html(list);
 *     RefinementListRenderingOptions.widgetParams.containerNode
 *       .find('li[data-refine-value]')
 *       .each(function() {
 *         $(this).on('click', function(event) {
 *           event.stopPropagation();
 *           event.preventDefault();
 *
 *           RefinementListRenderingOptions.refine($(this).data('refine-value'));
 *         });
 *       });
 *   } else {
 *     RefinementListRenderingOptions.widgetParams.containerNode.find('ul').html('');
 *   }
 *
 * // connect `renderFn` to RefinementList logic
 * var customRefinementList = instantsearch.connectors.connectRefinementList(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customRefinementList({
 *     containerNode: $('#custom-refinement-list-container'),
 *     attributeName: 'categories',
 *   })
 * );
 */
export default function connectRefinementList(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      operator = 'or',
      limit,
      sortBy = ['isRefined', 'count:desc', 'name:asc'],
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
