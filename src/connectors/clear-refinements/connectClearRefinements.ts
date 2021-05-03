import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import {
  checkRendering,
  clearRefinements,
  getRefinements,
  createDocumentationMessageGenerator,
  noop,
  uniq,
  mergeSearchParameters,
} from '../../lib/utils';
import {
  TransformItems,
  CreateURL,
  Connector,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'clear-refinements',
  connector: true,
});

export type ClearRefinementsConnectorParams = {
  /**
   * The attributes to include in the refinements to clear (all by default). Cannot be used with `excludedAttributes`.
   */
  includedAttributes?: string[];

  /**
   * The attributes to exclude from the refinements to clear. Cannot be used with `includedAttributes`.
   */
  excludedAttributes?: string[];

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<string>;
};

export type ClearRefinementsRenderState = {
  /**
   * Triggers the clear of all the currently refined values.
   */
  refine: () => void;

  /**
   * Indicates if search state is refined.
   * @deprecated prefer reading canRefine
   */
  hasRefinements: boolean;

  /**
   * Indicates if search state can be refined.
   */
  canRefine: boolean;

  /**
   * Creates a url for the next state when refinements are cleared.
   */
  createURL: CreateURL<void>;
};

export type ClearRefinementsWidgetDescription = {
  $$type: 'ais.clearRefinements';
  renderState: ClearRefinementsRenderState;
  indexRenderState: {
    clearRefinements: WidgetRenderState<
      ClearRefinementsRenderState,
      ClearRefinementsConnectorParams
    >;
  };
};

export type ClearRefinementsConnector = Connector<
  ClearRefinementsWidgetDescription,
  ClearRefinementsConnectorParams
>;

type AttributesToClear = {
  helper: AlgoliaSearchHelper;
  items: string[];
};

const connectClearRefinements: ClearRefinementsConnector = function connectClearRefinements(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      includedAttributes = [],
      excludedAttributes = ['query'],
      transformItems = (items => items) as TransformItems<string>,
    } = widgetParams || {};

    if (widgetParams.includedAttributes && widgetParams.excludedAttributes) {
      throw new Error(
        withUsage(
          'The options `includedAttributes` and `excludedAttributes` cannot be used together.'
        )
      );
    }

    type ConnectorState = {
      refine(): void;
      createURL(): string;
      attributesToClear: AttributesToClear[];
    };

    const connectorState: ConnectorState = {
      refine: noop,
      createURL: () => '',
      attributesToClear: [],
    };

    const cachedRefine = () => connectorState.refine();
    const cachedCreateURL = () => connectorState.createURL();

    return {
      $$type: 'ais.clearRefinements',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
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
          clearRefinements: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ createURL, scopedResults }) {
        connectorState.attributesToClear = scopedResults.reduce<
          Array<ReturnType<typeof getAttributesToClear>>
        >((results, scopedResult) => {
          return results.concat(
            getAttributesToClear({
              scopedResult,
              includedAttributes,
              excludedAttributes,
              transformItems,
            })
          );
        }, []);

        connectorState.refine = () => {
          connectorState.attributesToClear.forEach(
            ({ helper: indexHelper, items }) => {
              indexHelper
                .setState(
                  clearRefinements({
                    helper: indexHelper,
                    attributesToClear: items,
                  })
                )
                .search();
            }
          );
        };

        connectorState.createURL = () =>
          createURL(
            mergeSearchParameters(
              ...connectorState.attributesToClear.map(
                ({ helper: indexHelper, items }) => {
                  return clearRefinements({
                    helper: indexHelper,
                    attributesToClear: items,
                  });
                }
              )
            )
          );

        const canRefine = connectorState.attributesToClear.some(
          attributeToClear => attributeToClear.items.length > 0
        );

        return {
          canRefine,
          hasRefinements: canRefine,
          refine: cachedRefine,
          createURL: cachedCreateURL,
          widgetParams,
        };
      },
    };
  };
};

function getAttributesToClear({
  scopedResult,
  includedAttributes,
  excludedAttributes,
  transformItems,
}): AttributesToClear {
  const includesQuery =
    includedAttributes.indexOf('query') !== -1 ||
    excludedAttributes.indexOf('query') === -1;

  return {
    helper: scopedResult.helper,
    items: transformItems(
      uniq(
        getRefinements(
          scopedResult.results,
          scopedResult.helper.state,
          includesQuery
        )
          .map(refinement => refinement.attribute)
          .filter(
            attribute =>
              // If the array is empty (default case), we keep all the attributes
              includedAttributes.length === 0 ||
              // Otherwise, only add the specified attributes
              includedAttributes.indexOf(attribute) !== -1
          )
          .filter(
            attribute =>
              // If the query is included, we ignore the default `excludedAttributes = ['query']`
              (attribute === 'query' && includesQuery) ||
              // Otherwise, ignore the excluded attributes
              excludedAttributes.indexOf(attribute) === -1
          )
      )
    ),
  };
}

export default connectClearRefinements;
