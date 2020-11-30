import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  isEqual,
  noop,
} from '../../lib/utils';
import { SearchResults } from 'algoliasearch-helper';
import { Connector, TransformItems, CreateURL } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'breadcrumb',
  connector: true,
});

export type BreadcrumbConnectorParamsItem = {
  /**
   * Label of the category or subcategory.
   */
  label: string;

  /**
   * Value of breadcrumb item.
   */
  value: string;
};

export type BreadcrumbConnectorParams = {
  /**
   * Attributes to use to generate the hierarchy of the breadcrumb.
   */
  attributes: string[];

  /**
   * Prefix path to use if the first level is not the root level.
   */
  rootPath?: string;

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<BreadcrumbConnectorParamsItem>;

  /**
   * The level separator used in the records.
   *
   * @default '>'
   */
  separator?: string;
};

export type BreadcrumbRendererOptions = {
  /**
   * Creates the URL for a single item name in the list.
   */
  createURL: CreateURL<BreadcrumbConnectorParamsItem['value']>;

  /**
   * Array of objects defining the different values and labels.
   */
  items: BreadcrumbConnectorParamsItem[];

  /**
   * Sets the path of the hierarchical filter and triggers a new search.
   */
  refine: (value: BreadcrumbConnectorParamsItem['value']) => void;

  /**
   * True if refinement can be applied.
   */
  canRefine: boolean;
};

export type BreadcrumbConnector = Connector<
  BreadcrumbRendererOptions,
  BreadcrumbConnectorParams
>;

const connectBreadcrumb: BreadcrumbConnector = function connectBreadcrumb(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  type ConnectorState = {
    refine: BreadcrumbRendererOptions['refine'];
    createURL: BreadcrumbRendererOptions['createURL'];
  };

  const connectorState = {} as ConnectorState;

  return widgetParams => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      transformItems = items => items,
    } = widgetParams || ({} as typeof widgetParams);

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(
        withUsage('The `attributes` option expects an array of strings.')
      );
    }

    const [hierarchicalFacetName] = attributes;

    return {
      $$type: 'ais.breadcrumb',

      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          breadcrumb: {
            ...renderState.breadcrumb,
            [hierarchicalFacetName]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState({ helper, createURL, results, state }) {
        function getItems() {
          if (!results) {
            return [];
          }

          const [{ name: facetName }] = state.hierarchicalFacets;

          const facetValues = results.getFacetValues(
            facetName,
            {}
          ) as SearchResults.HierarchicalFacet;
          const data = Array.isArray(facetValues.data) ? facetValues.data : [];
          const items = transformItems(shiftItemsValues(prepareItems(data)));

          return items;
        }

        const items = getItems();



        if (!connectorState.createURL) {
          connectorState.createURL = facetValue => {
            if (!facetValue) {
              const breadcrumb = helper.getHierarchicalFacetBreadcrumb(
                hierarchicalFacetName
              );
              if (breadcrumb.length > 0) {
                return createURL(
                  helper.state.toggleFacetRefinement(
                    hierarchicalFacetName,
                    breadcrumb[0]
                  )
                );
              }
            }
            return createURL(
              helper.state.toggleFacetRefinement(
                hierarchicalFacetName,
                facetValue
              )
            );
          };
        }

        if (!connectorState.refine) {
          connectorState.refine = facetValue => {
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
              helper
                .toggleRefinement(hierarchicalFacetName, facetValue)
                .search();
            }
          };
        }

        return {
          canRefine: items.length > 0,
          createURL: connectorState.createURL,
          items,
          refine: connectorState.refine,
          widgetParams,
        };
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
};

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

export default connectBreadcrumb;
