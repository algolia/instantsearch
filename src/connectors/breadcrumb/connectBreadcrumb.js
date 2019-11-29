import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  isEqual,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'breadcrumb',
  connector: true,
});

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label Label of the category or subcategory.
 * @property {string} value Value of breadcrumb item.
 */

/**
 * @typedef {Object} CustomBreadcrumbWidgetOptions
 * @property {string[]} attributes Attributes to use to generate the hierarchy of the breadcrumb.
 * @property {string} [rootPath = null] Prefix path to use if the first level is not the root level.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 */

/**
 * @typedef {Object} BreadcrumbRenderingOptions
 * @property {function(item.value): string} createURL Creates an url for the next state for a clicked item. The special value `null` is used for the `Home` (or root) item of the breadcrumb and will return an empty array.
 * @property {BreadcrumbItem[]} items Values to be rendered.
 * @property {function(item.value)} refine Sets the path of the hierarchical filter and triggers a new search.
 * @property {Object} widgetParams All original `CustomBreadcrumbWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Breadcrumb** connector provides the logic to build a custom widget
 * that will give the user the ability to see the current path in a hierarchical facet.
 *
 * This is commonly used in websites that have a large amount of content organized in a hierarchical manner (usually e-commerce websites).
 * @type {Connector}
 * @param {function(BreadcrumbRenderingOptions, boolean)} renderFn Rendering function for the custom **Breadcrumb* widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomBreadcrumbWidgetOptions)} Re-usable widget factory for a custom **Breadcrumb** widget.
 */
export default function connectBreadcrumb(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());
  return (widgetParams = {}) => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      transformItems = items => items,
    } = widgetParams;

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(
        withUsage('The `attributes` option expects an array of strings.')
      );
    }

    const [hierarchicalFacetName] = attributes;

    return {
      $$type: 'ais.breadcrumb',

      init({ createURL, helper, instantSearchInstance }) {
        this._createURL = facetValue => {
          if (!facetValue) {
            const breadcrumb = helper.getHierarchicalFacetBreadcrumb(
              hierarchicalFacetName
            );
            if (breadcrumb.length > 0) {
              return createURL(
                helper.state.toggleRefinement(
                  hierarchicalFacetName,
                  breadcrumb[0]
                )
              );
            }
          }
          return createURL(
            helper.state.toggleRefinement(hierarchicalFacetName, facetValue)
          );
        };

        this._refine = function(facetValue) {
          if (!facetValue) {
            const breadcrumb = helper.getHierarchicalFacetBreadcrumb(
              hierarchicalFacetName
            );
            if (breadcrumb.length > 0) {
              helper
                .toggleRefinement(hierarchicalFacetName, breadcrumb[0])
                .search();
            }
          } else {
            helper.toggleRefinement(hierarchicalFacetName, facetValue).search();
          }
        };

        renderFn(
          {
            createURL: this._createURL,
            canRefine: false,
            instantSearchInstance,
            items: [],
            refine: this._refine,
            widgetParams,
          },
          true
        );
      },

      render({ instantSearchInstance, results, state }) {
        const [{ name: facetName }] = state.hierarchicalFacets;

        const facetValues = results.getFacetValues(facetName);
        const data = Array.isArray(facetValues.data) ? facetValues.data : [];
        const items = transformItems(shiftItemsValues(prepareItems(data)));

        renderFn(
          {
            canRefine: items.length > 0,
            createURL: this._createURL,
            instantSearchInstance,
            items,
            refine: this._refine,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getWidgetSearchParameters(searchParameters) {
        if (searchParameters.isHierarchicalFacet(hierarchicalFacetName)) {
          const facet = searchParameters.getHierarchicalFacetByName(
            hierarchicalFacetName
          );

          warning(
            isEqual(facet.attributes, attributes) &&
              facet.separator === separator &&
              facet.rootPath === rootPath,
            'Using Breadcrumb and HierarchicalMenu on the same facet with different options overrides the configuration of the HierarchicalMenu.'
          );

          return searchParameters;
        }

        return searchParameters.addHierarchicalFacet({
          name: hierarchicalFacetName,
          attributes,
          separator,
          rootPath,
        });
      },
    };
  };
}

function prepareItems(data) {
  return data.reduce((result, currentItem) => {
    if (currentItem.isRefined) {
      result.push({
        label: currentItem.name,
        value: currentItem.path,
      });
      if (Array.isArray(currentItem.data)) {
        result = result.concat(prepareItems(currentItem.data));
      }
    }
    return result;
  }, []);
}

function shiftItemsValues(array) {
  return array.map((x, idx) => ({
    label: x.label,
    value: idx + 1 === array.length ? null : array[idx + 1].value,
  }));
}
