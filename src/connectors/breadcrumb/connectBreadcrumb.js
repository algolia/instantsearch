import find from 'lodash/find';
import isEqual from 'lodash/isequal';

const usage = `Usage:
var customBreadcrumb = connectBreadcrumb(function renderFn(params, isFirstRendering) {
  // params = {
  //   items,
  //   refine,
  //   separator,
  //   rootURL,
  //   transformData,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(customBreadcrumb({
  attributes,
    [ separator = ' > ' ],
    [ rootURL = null ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectBreadcrumb.html
`;

/**
 * @typedef {Object} CustomHierarchicalMenuWidgetOptions
 * @property {string} [separator = ' > '] Symbol used in the attributes to separate level values.
 * @property {string} [rootURL = null] The root element’s URL (the originating page).
 * @property {HitsTransforms} [transformData] Method to change the object passed to the templates.
 */

/**
 * @typedef {Object} HierarchicalMenuRenderingOptions
 * @property {function(item.value): string} createURL Creates an url for the next state for a clicked item.
 * @property {HierarchicalMenuItem[]} items Values to be rendered.
 * @property {function(item.value)} refine Sets the path of the hierarchical filter and triggers a new search.
 * @property {Object} widgetParams All original `CustomBreadcrumbWidgetOptions` forwarded to the `renderFn`.
 */

/** 
 * Description + Example to be completed
 */

function prepareItems(obj) {
  return obj.data.reduce((result, currentItem) => {
    if (currentItem.isRefined) {
      result.push({
        name: currentItem.name,
        value: currentItem.path,
      });
      if (Array.isArray(currentItem.data)) {
        const children = prepareItems(currentItem);
        result = result.concat(children);
      }
    }
    return result;
  }, []);
}

export default function connectBreadcrumb(renderFn) {
  return (widgetParams = {}) => {
    const { attributes, separator = ' > ', rootURL = null } = widgetParams;
    const [hierarchicalFacetName] = attributes;

    return {
      getConfiguration: currentConfiguration => {
        if (currentConfiguration.hierarchicalFacets) {
          const facetSet = find(
            currentConfiguration.hierarchicalFacets,
            ({ name }) => name === hierarchicalFacetName,
          );
          if (facetSet) {
            if (
              !isEqual(facetSet.attributes, attributes) ||
              facetSet.separator !== separator
            ) {
              console.warn(
                'using Breadcrumb & HierarchicalMenu on the same facet with different options',
              );
            }
            return {};
          }
        }

        return {
          hierarchicalFacets: [
            {
              name: hierarchicalFacetName,
              attributes,
              separator,
              // rootPath,
            },
          ],
        };
      },

      init({ helper, instantSearchInstance }) {
        this._refine = function(facetValue) {
          if (!facetValue) {
            const breadcrumb = helper.getHierarchicalFacetBreadcrumb(
              hierarchicalFacetName,
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
            items: [],
            refine: this._refine,
            canRefine: false,
            instantSearchInstance,
            widgetParams,
          },
          true,
        );
      },

      render({ results, state, instantSearchInstance }) {
        if (
          !state.hierarchicalFacets ||
          (Array.isArray(state.hierarchicalFacets) &&
            state.hierarchicalFacets.length === 0)
        ) {
          throw new Error(usage);
        }

        const [{ name: facetName }] = state.hierarchicalFacets;

        const facetsValues = results.getFacetValues(facetName);
        const items = prepareItems(facetsValues);

        renderFn(
          {
            items,
            refine: this._refine,
            canRefine: items.length > 0,
            widgetParams,
            instantSearchInstance,
          },
          false,
        );
      },
    };
  };
}
