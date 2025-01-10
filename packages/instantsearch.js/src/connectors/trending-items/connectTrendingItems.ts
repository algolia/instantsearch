import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
  escapeHits,
  TAG_PLACEHOLDER,
  getObjectType,
  SendEventForHits,
  createSendEventForHits,
  addAbsolutePosition,
  addQueryID,
} from '../../lib/utils';

import type {
  Connector,
  TransformItems,
  BaseHit,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  RecommendResponse,
  AlgoliaHit,
} from '../../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-items',
  connector: true,
});

export type TrendingItemsRenderState<
  THit extends NonNullable<object> = BaseHit
> = {
  /**
   * The matched recommendations from the Algolia API.
   */
  items: Array<AlgoliaHit<THit>>;

  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;
};

export type TrendingItemsConnectorParams<
  THit extends NonNullable<object> = BaseHit
> = (
  | {
      /**
       * The facet attribute to get recommendations for.
       */
      facetName: string;
      /**
       * The facet value to get recommendations for.
       */
      facetValue: string;
    }
  | {
      facetName?: string;
      facetValue?: string;
    }
) & {
  /**
   * The number of recommendations to retrieve.
   */
  limit?: number;
  /**
   * The threshold for the recommendations confidence score (between 0 and 100).
   */
  threshold?: number;
  /**
   * List of search parameters to send.
   */
  fallbackParameters?: Omit<
    PlainSearchParameters,
    'page' | 'hitsPerPage' | 'offset' | 'length'
  >;
  /**
   * List of search parameters to send.
   */
  queryParameters?: Omit<
    PlainSearchParameters,
    'page' | 'hitsPerPage' | 'offset' | 'length'
  >;
  /**
   * Whether to escape HTML tags from items string values.
   *
   * @default true
   */
  escapeHTML?: boolean;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<
    AlgoliaHit<THit>,
    { results: RecommendResponse<AlgoliaHit<THit>> }
  >;
};

export type TrendingItemsWidgetDescription<
  THit extends NonNullable<object> = BaseHit
> = {
  $$type: 'ais.trendingItems';
  renderState: TrendingItemsRenderState<THit>;
};

export type TrendingItemsConnector<THit extends NonNullable<object> = BaseHit> =
  Connector<
    TrendingItemsWidgetDescription<THit>,
    TrendingItemsConnectorParams<THit>
  >;

export default (function connectTrendingItems<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    TrendingItemsRenderState,
    TWidgetParams & TrendingItemsConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <THit extends NonNullable<object> = BaseHit>(
    widgetParams: TWidgetParams & TrendingItemsConnectorParams<THit>
  ) => {
    const {
      facetName,
      facetValue,
      limit,
      threshold,
      fallbackParameters,
      queryParameters,
      // @MAJOR: this can default to false
      escapeHTML = true,
      transformItems = ((items) => items) as NonNullable<
        TrendingItemsConnectorParams<THit>['transformItems']
      >,
    } = widgetParams || {};

    if ((facetName && !facetValue) || (!facetName && facetValue)) {
      throw new Error(
        withUsage(
          `When you provide facetName (received type ${getObjectType(
            facetName
          )}), you must also provide facetValue (received type ${getObjectType(
            facetValue
          )}).`
        )
      );
    }

    let sendEvent: SendEventForHits;

    return {
      dependsOn: 'recommend',
      $$type: 'ais.trendingItems',

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
        const renderState = this.getWidgetRenderState(renderOptions);

        renderFn(
          {
            ...renderState,
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState) {
        return renderState;
      },

      getWidgetRenderState({ results, helper, instantSearchInstance }) {
        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            getIndex: () => helper.getIndex(),
            widgetType: this.$$type,
          });
        }
        if (results === null || results === undefined) {
          return { items: [], widgetParams, sendEvent };
        }

        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        const itemsWithAbsolutePosition = addAbsolutePosition(
          results.hits,
          0,
          1
        );

        const itemsWithAbsolutePositionAndQueryID = addQueryID(
          itemsWithAbsolutePosition,
          results.queryID
        );

        const transformedItems = transformItems(
          itemsWithAbsolutePositionAndQueryID,
          {
            results: results as RecommendResponse<AlgoliaHit<THit>>,
          }
        );

        return {
          items: transformedItems,
          widgetParams,
          sendEvent,
        };
      },

      dispose({ recommendState }) {
        unmountFn();
        return recommendState.removeParams(this.$$id!);
      },

      getWidgetParameters(state) {
        return state.removeParams(this.$$id!).addTrendingItems({
          facetName: facetName as string,
          facetValue: facetValue as string,
          maxRecommendations: limit,
          threshold,
          fallbackParameters: {
            ...fallbackParameters,
            ...(escapeHTML ? TAG_PLACEHOLDER : {}),
          },
          queryParameters: {
            ...queryParameters,
            ...(escapeHTML ? TAG_PLACEHOLDER : {}),
          },
          $$id: this.$$id!,
        });
      },
    };
  };
} satisfies TrendingItemsConnector);
