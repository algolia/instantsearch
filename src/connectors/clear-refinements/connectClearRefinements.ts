import {
  checkRendering,
  clearRefinements,
  getRefinements,
  createDocumentationMessageGenerator,
  noop,
  uniq,
  mergeSearchParameters,
} from '../../lib/utils';
import { TransformItems, CreateURL, Connector } from '../../types';

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

export type ClearRefinementsRendererOptions = {
  /**
   * Triggers the clear of all the currently refined values.
   */
  refine: () => void;

  /**
   * Indicates if search state is refined.
   */
  hasRefinements: boolean;

  /**
   * Creates a url for the next state when refinements are cleared.
   */
  createURL: CreateURL<void>;
};

export type ClearRefinementsConnector = Connector<
  ClearRefinementsRendererOptions,
  ClearRefinementsConnectorParams
>;

const connectClearRefinements: ClearRefinementsConnector = function connectClearRefinements(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      includedAttributes = [],
      excludedAttributes = ['query'],
      transformItems = items => items,
    } = widgetParams || ({} as typeof widgetParams);

    if (widgetParams.includedAttributes && widgetParams.excludedAttributes) {
      throw new Error(
        withUsage(
          'The options `includedAttributes` and `excludedAttributes` cannot be used together.'
        )
      );
    }

    const connectorState = {
      refine: noop,
      createURL: () => '',
    };

    const cachedRefine = () => connectorState.refine();
    const cachedCreateURL = () => connectorState.createURL();

    return {
      $$type: 'ais.clearRefinements',

      init(initOptions) {
        const { renderState, instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState!(renderState, initOptions)
              .clearRefinements!,
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const {
          scopedResults,
          createURL,
          renderState,
          instantSearchInstance,
        } = renderOptions;

        const attributesToClear = scopedResults.reduce<
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
          attributesToClear.forEach(({ helper: indexHelper, items }) => {
            indexHelper
              .setState(
                clearRefinements({
                  helper: indexHelper,
                  attributesToClear: items,
                })
              )
              .search();
          });
        };

        connectorState.createURL = () =>
          createURL(
            mergeSearchParameters(
              ...attributesToClear.map(({ helper: indexHelper, items }) => {
                return clearRefinements({
                  helper: indexHelper,
                  attributesToClear: items,
                });
              })
            )
          );

        renderFn(
          {
            ...this.getWidgetRenderState!(renderState, renderOptions)
              .clearRefinements!,
            instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getWidgetRenderState(renderState, { scopedResults }) {
        const attributesToClear = scopedResults.reduce<
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

        return {
          ...renderState,
          clearRefinements: {
            hasRefinements: attributesToClear.some(
              attributeToClear => attributeToClear.items.length > 0
            ),
            refine: cachedRefine,
            createURL: cachedCreateURL,
            widgetParams,
          },
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
}) {
  const clearsQuery =
    includedAttributes.indexOf('query') !== -1 ||
    excludedAttributes.indexOf('query') === -1;

  return {
    helper: scopedResult.helper,
    items: transformItems(
      uniq(
        getRefinements(
          scopedResult.results,
          scopedResult.helper.state,
          clearsQuery
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
              (attribute === 'query' && clearsQuery) ||
              // Otherwise, ignore the excluded attributes
              excludedAttributes.indexOf(attribute) === -1
          )
      )
    ),
  };
}

export default connectClearRefinements;
