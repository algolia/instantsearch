import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  isEqual,
  noop,
} from '../../lib/utils';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import {
  Connector,
  TransformItems,
  CreateURL,
  WidgetRenderState,
} from '../../types';

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

  return widgetParams => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      transformItems = (items => items) as TransformItems<
        BreadcrumbConnectorParamsItem
      >,
    } = widgetParams || {};

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(
        withUsage('The `attributes` option expects an array of strings.')
      );
    }

    const [hierarchicalFacetName] = attributes;

    function getRefinedState(state: SearchParameters, facetValue: string) {
      if (!facetValue) {
        const breadcrumb = state.getHierarchicalFacetBreadcrumb(
          hierarchicalFacetName
        );
        if (breadcrumb.length > 0) {
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
            return createURL(getRefinedState(helper.state, facetValue));
          };
        }

        if (!connectorState.refine) {
          connectorState.refine = facetValue => {
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
