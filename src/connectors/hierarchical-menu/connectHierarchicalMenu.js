import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import { checkRendering, warn } from '../../lib/utils.js';

const usage = `Usage:
var customHierarchicalMenu = connectHierarchicalMenu(function renderFn(params, isFirstRendering) {
  // params = {
  //   createURL,
  //   items,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customHierarchicalMenu({
    attributes,
    [ separator = ' > ' ],
    [ rootPath = null ],
    [ showParentLevel = true ],
    [ limit = 10 ],
    [ sortBy = ['name:asc'] ],
    [ transformItems ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectHierarchicalMenu.html
`;

/**
 * @typedef {Object} HierarchicalMenuItem
 * @property {string} value Value of the menu item.
 * @property {string} label Human-readable value of the menu item.
 * @property {number} count Number of matched results after refinement is applied.
 * @property {isRefined} boolean Indicates if the refinement is applied.
 * @property {Object} [data = undefined] n+1 level of items, same structure HierarchicalMenuItem (default: `undefined`).
 */

/**
 * @typedef {Object} CustomHierarchicalMenuWidgetOptions
 * @property {string[]} attributes Attributes to use to generate the hierarchy of the menu.
 * @property {string} [separator = '>'] Separator used in the attributes to separate level values.
 * @property {string} [rootPath = null] Prefix path to use if the first level is not the root level.
 * @property {boolean} [showParentLevel=false] Show the siblings of the selected parent levels of the current refined value. This
 * does not impact the root level.
 * @property {number} [limit = 10] Max number of value to display.
 * @property  {string[]|function} [sortBy = ['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} HierarchicalMenuRenderingOptions
 * @property {function(item.value): string} createURL Creates an url for the next state for a clicked item.
 * @property {HierarchicalMenuItem[]} items Values to be rendered.
 * @property {function(item.value)} refine Sets the path of the hierarchical filter and triggers a new search.
 * @property {Object} widgetParams All original `CustomHierarchicalMenuWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **HierarchicalMenu** connector provides the logic to build a custom widget
 * that will give the user the ability to explore facets in a tree-like structure.
 *
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two
 * levels deep.
 *
 * There's a complete example available on how to write a custom **HierarchicalMenu**:
 *  [hierarchicalMenu.js](https://github.com/algolia/instantsearch.js/blob/develop/storybook/app/jquery/widgets/hierarchicalMenu.js)
 * @type {Connector}
 * @param {function(HierarchicalMenuRenderingOptions)} renderFn Rendering function for the custom **HierarchicalMenu** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomHierarchicalMenuWidgetOptions)} Re-usable widget factory for a custom **HierarchicalMenu** widget.
 */
export default function connectHierarchicalMenu(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      showParentLevel = true,
      limit = 10,
      showMoreLimit,
      sortBy = ['name:asc'],
      transformItems = items => items,
    } = widgetParams;

    if (!attributes || !attributes.length) {
      throw new Error(usage);
    }

    // we need to provide a hierarchicalFacet name for the search state
    // so that we can always map $hierarchicalFacetName => real attributes
    // we use the first attribute name
    const [hierarchicalFacetName] = attributes;

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

      getConfiguration: currentConfiguration => {
        if (currentConfiguration.hierarchicalFacets) {
          const isFacetSet = find(
            currentConfiguration.hierarchicalFacets,
            ({ name }) => name === hierarchicalFacetName
          );
          if (
            isFacetSet &&
            !(
              isEqual(isFacetSet.attributes, attributes) &&
              isFacetSet.separator === separator
            )
          ) {
            warn(
              'Using Breadcrumb and HierarchicalMenu on the same facet with different options overrides the configuration of the HierarchicalMenu.'
            );
            return {};
          }
        }

        const widgetConfiguration = {
          hierarchicalFacets: [
            {
              name: hierarchicalFacetName,
              attributes,
              separator,
              rootPath,
              showParentLevel,
            },
          ],
        };

        if (limit !== undefined) {
          const currentMaxValuesPerFacet =
            currentConfiguration.maxValuesPerFacet || 0;
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
        this._refine = function(facetValue) {
          helper.toggleRefinement(hierarchicalFacetName, facetValue).search();
        };

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(
            helper.state.toggleRefinement(hierarchicalFacetName, facetValue)
          );
        }

        renderFn(
          {
            createURL: _createURL,
            items: [],
            refine: this._refine,
            instantSearchInstance,
            widgetParams,
            isShowingMore: false,
            toggleShowMore: this.cachedToggleShowMore,
            canToggleShowMore: false,
          },
          true
        );
      },

      _prepareFacetValues(facetValues, state) {
        return facetValues
          .slice(0, this.getLimit())
          .map(({ name: label, path: value, ...subValue }) => {
            if (Array.isArray(subValue.data)) {
              subValue.data = this._prepareFacetValues(subValue.data, state);
            }
            return { ...subValue, label, value };
          });
      },

      render(renderOptions) {
        const {
          results,
          state,
          createURL,
          instantSearchInstance,
        } = renderOptions;

        const facetValues =
          results.getFacetValues(hierarchicalFacetName, { sortBy }).data || [];
        const items = transformItems(
          this._prepareFacetValues(facetValues),
          state
        );

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(
            state.toggleRefinement(hierarchicalFacetName, facetValue)
          );
        }

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

        this.toggleShowMore = this.createToggleShowMore(renderOptions);

        renderFn(
          {
            createURL: _createURL,
            items,
            refine: this._refine,
            instantSearchInstance,
            widgetParams,
            isShowingMore: this.isShowingMore,
            toggleShowMore: this.cachedToggleShowMore,
            canToggleShowMore: showMoreLimit
              ? this.isShowingMore || !hasExhaustiveItems
              : false,
          },
          false
        );
      },

      dispose({ state }) {
        // unmount widget from DOM
        unmountFn();

        // compute nextState for the search
        let nextState = state;

        if (state.isHierarchicalFacetRefined(hierarchicalFacetName)) {
          nextState = state.removeHierarchicalFacetRefinement(
            hierarchicalFacetName
          );
        }

        nextState = nextState.removeHierarchicalFacet(hierarchicalFacetName);

        if (nextState.maxValuesPerFacet === limit) {
          nextState.setQueryParameters('maxValuesPerFacet', undefined);
        }

        return nextState;
      },

      getWidgetState(uiState, { searchParameters }) {
        const path = searchParameters.getHierarchicalFacetBreadcrumb(
          hierarchicalFacetName
        );
        if (!path || path.length === 0) return uiState;
        if (
          uiState.hierarchicalMenu &&
          isEqual(path, uiState.hierarchicalMenu[hierarchicalFacetName])
        ) {
          return uiState;
        }

        return {
          ...uiState,
          hierarchicalMenu: {
            ...uiState.hierarchicalMenu,
            [hierarchicalFacetName]: path,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        if (
          uiState.hierarchicalMenu &&
          uiState.hierarchicalMenu[hierarchicalFacetName]
        ) {
          return searchParameters
            .clearRefinements(hierarchicalFacetName)
            .toggleRefinement(
              hierarchicalFacetName,
              uiState.hierarchicalMenu[hierarchicalFacetName].join(separator)
            );
        } else {
          return searchParameters;
        }
      },
    };
  };
}
