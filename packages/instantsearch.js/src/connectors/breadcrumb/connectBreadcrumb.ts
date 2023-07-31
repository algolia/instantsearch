import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  isEqual,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  TransformItems,
  CreateURL,
  WidgetRenderState,
} from '../../types';
import type { SearchParameters, SearchResults } from 'algoliasearch-helper';

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
  value: string | null;
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

export type BreadcrumbRenderState = {
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

export type BreadcrumbWidgetDescription = {
  $$type: 'ais.breadcrumb';
  renderState: BreadcrumbRenderState;
  indexRenderState: {
    breadcrumb: {
      [rootAttribute: string]: WidgetRenderState<
        BreadcrumbRenderState,
        BreadcrumbConnectorParams
      >;
    };
  };
};

export type BreadcrumbConnector = Connector<
  BreadcrumbWidgetDescription,
  BreadcrumbConnectorParams
>;

const connectBreadcrumb: BreadcrumbConnector = function connectBreadcrumb(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  type ConnectorState = {
    refine?: BreadcrumbRenderState['refine'];
    createURL?: BreadcrumbRenderState['createURL'];
  };

  const connectorState: ConnectorState = {};

  return (widgetParams) => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      transformItems = ((items) => items) as NonNullable<
        BreadcrumbConnectorParams['transformItems']
      >,
    } = widgetParams || {};

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(
        withUsage('The `attributes` option expects an array of strings.')
      );
    }

    const [hierarchicalFacetName] = attributes;

    function getRefinedState(
      state: SearchParameters,
      facetValue: BreadcrumbConnectorParamsItem['value']
    ) {
      if (!facetValue) {
        const breadcrumb = state.getHierarchicalFacetBreadcrumb(
          hierarchicalFacetName
        );
        if (breadcrumb.length === 0) {
          return state;
        } else {
          return state
            .resetPage()
            .toggleFacetRefinement(hierarchicalFacetName, breadcrumb[0]);
        }
      }
      return state
        .resetPage()
        .toggleFacetRefinement(hierarchicalFacetName, facetValue);
    }

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
          // The hierarchicalFacets condition is required for flavors
          // that render immediately with empty results, without relying
          // on init() (like React InstantSearch).
          if (!results || state.hierarchicalFacets.length === 0) {
            return [];
          }

          const [{ name: facetName }] = state.hierarchicalFacets;

          const facetValues = results.getFacetValues(facetName, {});
          const facetItems =
            facetValues && !Array.isArray(facetValues) && facetValues.data
              ? facetValues.data
              : [];
          const items = transformItems(
            shiftItemsValues(prepareItems(facetItems)),
            {
              results,
            }
          );

          return items;
        }

        const items = getItems();

        if (!connectorState.createURL) {
          connectorState.createURL = (facetValue) => {
            return createURL((uiState) =>
              this.getWidgetUiState!(uiState, {
                searchParameters: getRefinedState(helper.state, facetValue),
                helper,
              })
            );
          };
        }

        if (!connectorState.refine) {
          connectorState.refine = (facetValue) => {
            helper.setState(getRefinedState(helper.state, facetValue)).search();
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

      getWidgetUiState(uiState, { searchParameters }) {
        const path = searchParameters.getHierarchicalFacetBreadcrumb(
          hierarchicalFacetName
        );

        if (!path.length) {
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
        const values =
          uiState.hierarchicalMenu &&
          uiState.hierarchicalMenu[hierarchicalFacetName];

        if (
          searchParameters.isConjunctiveFacet(hierarchicalFacetName) ||
          searchParameters.isDisjunctiveFacet(hierarchicalFacetName)
        ) {
          warning(
            false,
            `HierarchicalMenu: Attribute "${hierarchicalFacetName}" is already used by another widget applying conjunctive or disjunctive faceting.
As this is not supported, please make sure to remove this other widget or this HierarchicalMenu widget will not work at all.`
          );

          return searchParameters;
        }

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
        }

        const withFacetConfiguration = searchParameters
          .removeHierarchicalFacet(hierarchicalFacetName)
          .addHierarchicalFacet({
            name: hierarchicalFacetName,
            attributes,
            separator,
            rootPath,
          });

        if (!values) {
          return withFacetConfiguration.setQueryParameters({
            hierarchicalFacetsRefinements: {
              ...withFacetConfiguration.hierarchicalFacetsRefinements,
              [hierarchicalFacetName]: [],
            },
          });
        }

        return withFacetConfiguration.addHierarchicalFacetRefinement(
          hierarchicalFacetName,
          values.join(separator)
        );
      },
    };
  };
};

function prepareItems(data: SearchResults.HierarchicalFacet[]) {
  return data.reduce<BreadcrumbConnectorParamsItem[]>((result, currentItem) => {
    if (currentItem.isRefined) {
      result.push({
        label: currentItem.name,
        value: currentItem.escapedValue,
      });
      if (Array.isArray(currentItem.data)) {
        result = result.concat(prepareItems(currentItem.data));
      }
    }
    return result;
  }, []);
}

function shiftItemsValues(array: BreadcrumbConnectorParamsItem[]) {
  return array.map((x, idx) => ({
    label: x.label,
    value: idx + 1 === array.length ? null : array[idx + 1].value,
  }));
}

export default connectBreadcrumb;
