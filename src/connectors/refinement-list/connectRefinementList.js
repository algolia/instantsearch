import { checkRendering } from '../../lib/utils';
import { tagConfig, escapeFacets } from '../../lib/escape-highlight';
import isEqual from 'lodash/isEqual';

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
  //   toggleShowMore,
  //   isShowingMore,
  //   widgetParams,
  // }
});
search.addWidget(
  customRefinementList({
    attributeName,
    [ operator = 'or' ],
    [ limit ],
    [ showMoreLimit ],
    [ sortBy = ['isRefined', 'count:desc', 'name:asc'] ],
    [ escapeFacetValues = false ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectRefinementList.html
`;

export const checkUsage = ({
  attributeName,
  operator,
  usageMessage,
  showMoreLimit,
  limit,
}) => {
  const noAttributeName = attributeName === undefined;
  const invalidOperator = !/^(and|or)$/.test(operator);
  const invalidShowMoreLimit =
    showMoreLimit !== undefined
      ? isNaN(showMoreLimit) || showMoreLimit < limit
      : false;

  if (noAttributeName || invalidOperator || invalidShowMoreLimit) {
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
 * @property {number} [limit = 10] The max number of items to display when
 * `showMoreLimit` is not set or if the widget is showing less value.
 * @property {number} [showMoreLimit] The max number of items to display if the widget
 * is showing more items.
 * @property {string[]|function} [sortBy = ['isRefined', 'count:desc', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 * @property {boolean} [escapeFacetValues = false] Escapes the content of the facet values.
 */

/**
 * @typedef {Object} RefinementListRenderingOptions
 * @property {RefinementListItem[]} items The list of filtering values returned from Algolia API.
 * @property {function(item.value): string} createURL Creates the next state url for a selected refinement.
 * @property {function(item.value)} refine Action to apply selected refinements.
 * @property {function} searchForItems Searches for values inside the list.
 * @property {boolean} isFromSearch `true` if the values are from an index search.
 * @property {boolean} canRefine `true` if a refinement can be applied.
 * @property {boolean} canToggleShowMore `true` if the toggleShowMore button can be activated (enough items to display more or
 * already displaying more than `limit` items)
 * @property {Object} widgetParams All original `CustomRefinementListWidgetOptions` forwarded to the `renderFn`.
 * @property {boolean} isShowingMore True if the menu is displaying all the menu items.
 * @property {function} toggleShowMore Toggles the number of values displayed between `limit` and `showMoreLimit`.
 */

/**
 * **RefinementList** connector provides the logic to build a custom widget that will let the
 * user filter the results based on the values of a specific facet.
 *
 * This connector provides a `toggleShowMore()` function to display more or less items and a `refine()`
 * function to select an item.
 * @type {Connector}
 * @param {function(RefinementListRenderingOptions, boolean)} renderFn Rendering function for the custom **RefinementList** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
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
 *       return `
 *         <li data-refine-value="${item.value}">
 *           <input type="checkbox" value="${item.value}" ${item.isRefined ? 'checked' : ''} />
 *           <a href="${RefinementListRenderingOptions.createURL(item.value)}">
 *             ${item.label} (${item.count})
 *           </a>
 *         </li>
 *       `;
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
 * }
 *
 * // connect `renderFn` to RefinementList logic
 * var customRefinementList = instantsearch.connectors.connectRefinementList(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customRefinementList({
 *     containerNode: $('#custom-refinement-list-container'),
 *     attributeName: 'categories',
 *     limit: 10,
 *   })
 * );
 */
export default function connectRefinementList(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      operator = 'or',
      limit = 10,
      showMoreLimit,
      sortBy = ['isRefined', 'count:desc', 'name:asc'],
      escapeFacetValues = false,
    } = widgetParams;

    checkUsage({ attributeName, operator, usage, limit, showMoreLimit });

    const formatItems = ({ name: label, ...item }) => ({
      ...item,
      label,
      value: label,
      highlighted: label,
    });

    const render = ({
      items,
      state,
      createURL,
      helperSpecializedSearchFacetValues,
      refine,
      isFromSearch,
      isFirstSearch,
      isShowingMore,
      toggleShowMore,
      hasExhaustiveItems,
      instantSearchInstance,
    }) => {
      // Compute a specific createURL method able to link to any facet value state change
      const _createURL = facetValue =>
        createURL(state.toggleRefinement(attributeName, facetValue));

      // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
      // function
      const searchFacetValues =
        helperSpecializedSearchFacetValues &&
        helperSpecializedSearchFacetValues(
          state,
          createURL,
          helperSpecializedSearchFacetValues,
          refine,
          instantSearchInstance
        );

      renderFn(
        {
          createURL: _createURL,
          items,
          refine,
          searchForItems: searchFacetValues,
          instantSearchInstance,
          isFromSearch,
          canRefine: isFromSearch || items.length > 0,
          widgetParams,
          isShowingMore,
          canToggleShowMore: showMoreLimit
            ? isShowingMore || !hasExhaustiveItems
            : false,
          toggleShowMore,
          hasExhaustiveItems,
        },
        isFirstSearch
      );
    };

    let lastResultsFromMainSearch;
    let searchForFacetValues;
    let refine;

    const createSearchForFacetValues = helper => (
      state,
      createURL,
      helperSpecializedSearchFacetValues,
      toggleRefinement,
      instantSearchInstance
    ) => query => {
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
          hasExhaustiveItems: false, // SFFV should not be used with show more
        });
      } else {
        const tags = {
          highlightPreTag: escapeFacetValues
            ? tagConfig.highlightPreTag
            : undefined,
          highlightPostTag: escapeFacetValues
            ? tagConfig.highlightPostTag
            : undefined,
        };

        helper
          .searchForFacetValues(attributeName, query, limit, tags)
          .then(results => {
            const facetValues = escapeFacetValues
              ? escapeFacets(results.facetHits)
              : results.facetHits;

            const normalizedFacetValues = facetValues.map(
              ({ value, ...item }) => ({
                ...item,
                value,
                label: value,
              })
            );

            render({
              items: normalizedFacetValues,
              state,
              createURL,
              helperSpecializedSearchFacetValues,
              refine: toggleRefinement,
              isFromSearch: true,
              isFirstSearch: false,
              instantSearchInstance,
              hasExhaustiveItems: false, // SFFV should not be used with show more
            });
          });
      }
    };

    return {
      isShowingMore: false,

      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      toggleShowMore() {},
      cachedToggleShowMore() {
        this.toggleShowMore();
      },

      createToggleShowMore(renderOptions) {
        return () => {
          this.isShowingMore = !this.isShowingMore;
          this.render(renderOptions);
        };
      },

      getLimit() {
        return this.isShowingMore ? showMoreLimit : limit;
      },

      getConfiguration: (configuration = {}) => {
        const widgetConfiguration = {
          [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [
            attributeName,
          ],
        };

        if (limit !== undefined) {
          const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
          if (showMoreLimit === undefined) {
            widgetConfiguration.maxValuesPerFacet = Math.max(
              currentMaxValuesPerFacet,
              limit
            );
          } else {
            widgetConfiguration.maxValuesPerFacet = Math.max(
              currentMaxValuesPerFacet,
              limit,
              showMoreLimit
            );
          }
        }

        return widgetConfiguration;
      },

      init({ helper, createURL, instantSearchInstance }) {
        this.cachedToggleShowMore = this.cachedToggleShowMore.bind(this);

        refine = facetValue =>
          helper.toggleRefinement(attributeName, facetValue).search();

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
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
          hasExhaustiveItems: true,
        });
      },

      render(renderOptions) {
        const {
          results,
          state,
          createURL,
          instantSearchInstance,
        } = renderOptions;

        const facetValues = results.getFacetValues(attributeName, { sortBy });
        const items = facetValues.slice(0, this.getLimit()).map(formatItems);

        const maxValuesPerFacetConfig = state.getQueryParameter(
          'maxValuesPerFacet'
        );
        const currentLimit = this.getLimit();
        // If the limit is the max number of facet retrieved it is impossible to know
        // if the facets are exhaustive. The only moment we are sure it is exhaustive
        // is when it is strictly under the number requested unless we know that another
        // widget has requested more values (maxValuesPerFacet > getLimit()).
        // Because this is used for making the search of facets unable or not, it is important
        // to be conservative here.
        const hasExhaustiveItems =
          maxValuesPerFacetConfig > currentLimit
            ? facetValues.length <= currentLimit
            : facetValues.length < currentLimit;

        lastResultsFromMainSearch = items;

        this.toggleShowMore = this.createToggleShowMore(renderOptions);

        render({
          items,
          state,
          createURL,
          helperSpecializedSearchFacetValues: searchForFacetValues,
          refine,
          isFromSearch: false,
          isFirstSearch: false,
          instantSearchInstance,
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
          hasExhaustiveItems,
        });
      },

      dispose({ state }) {
        unmountFn();

        if (operator === 'and') {
          return state
            .removeFacetRefinement(attributeName)
            .removeFacet(attributeName);
        } else {
          return state
            .removeDisjunctiveFacetRefinement(attributeName)
            .removeDisjunctiveFacet(attributeName);
        }
      },

      getWidgetState(uiState, { searchParameters }) {
        const values =
          operator === 'or'
            ? searchParameters.getDisjunctiveRefinements(attributeName)
            : searchParameters.getConjunctiveRefinements(attributeName);

        if (
          values.length === 0 ||
          (uiState.refinementList &&
            isEqual(values, uiState.refinementList[attributeName]))
        ) {
          return uiState;
        }

        return {
          ...uiState,
          refinementList: {
            ...uiState.refinementList,
            [attributeName]: values,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const values =
          uiState.refinementList && uiState.refinementList[attributeName];
        if (values === undefined) return searchParameters;
        return values.reduce(
          (sp, v) =>
            operator === 'or'
              ? sp.addDisjunctiveFacetRefinement(attributeName, v)
              : sp.addFacetRefinement(attributeName, v),
          searchParameters.clearRefinements(attributeName)
        );
      },
    };
  };
}
