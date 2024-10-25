import {
  createDocumentationMessageGenerator,
  noop,
  escapeHits,
  TAG_PLACEHOLDER,
} from '../lib/public';
import {
  checkRendering,
  createSendEventForHits,
  addQueryID,
  addAbsolutePosition,
} from '../lib/utils';

import type {
  Connector,
  TransformItems,
  BaseHit,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  RecommendResponse,
  Hit,
  AlgoliaHit,
  Widget,
  SendEventForHits,
} from '../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'looking-similar',
  connector: true,
});

export type LookingSimilarRenderState<
  THit extends NonNullable<object> = BaseHit
> = {
  /**
   * The matched recommendations from the Algolia API.
   */
  items: Array<Hit<THit>>;
  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;
};

export type LookingSimilarConnectorParams<
  THit extends NonNullable<object> = BaseHit
> = {
  /**
   * The `objectIDs` of the items to get similar looking products from.
   */
  objectIDs: string[];
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
    Hit<THit>,
    { results: RecommendResponse<AlgoliaHit<THit>> }
  >;
};

export type LookingSimilarWidgetDescription<
  THit extends NonNullable<object> = BaseHit
> = {
  $$type: 'ais.lookingSimilar';
  renderState: LookingSimilarRenderState<THit>;
};

export type LookingSimilarConnector<
  THit extends NonNullable<object> = BaseHit
> = Connector<
  LookingSimilarWidgetDescription<THit>,
  LookingSimilarConnectorParams<THit>
>;

export const connectLookingSimilar = function connectLookingSimilar<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    LookingSimilarRenderState,
    TWidgetParams & LookingSimilarConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <THit extends NonNullable<object> = BaseHit>(
    widgetParams: TWidgetParams & LookingSimilarConnectorParams<THit>
  ) => {
    const {
      // @MAJOR: this can default to false
      escapeHTML = true,
      objectIDs,
      limit,
      threshold,
      fallbackParameters,
      queryParameters,
      transformItems = ((items) => items) as NonNullable<
        LookingSimilarConnectorParams<THit>['transformItems']
      >,
    } = widgetParams || {};

    if (!objectIDs || objectIDs.length === 0) {
      throw new Error(withUsage('The `objectIDs` option is required.'));
    }

    type LookingSimilarWidget = Widget<
      LookingSimilarWidgetDescription<THit> & {
        widgetParams: typeof widgetParams;
      }
    >;

    let sendEvent: SendEventForHits;

    const widget: LookingSimilarWidget = {
      dependsOn: 'recommend',
      $$type: 'ais.lookingSimilar',

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

      getWidgetRenderState({ results, instantSearchInstance, helper }) {
        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            getIndex: () => helper.getIndex(),
            widgetType: this.$$type,
          });
        }
        if (results === null || results === undefined) {
          return { items: [], sendEvent, widgetParams };
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
          sendEvent,
          widgetParams,
        };
      },

      dispose({ recommendState }) {
        unmountFn();
        return recommendState.removeParams(this.$$id!);
      },

      getWidgetParameters(state) {
        return objectIDs.reduce(
          (acc, objectID) =>
            acc.addLookingSimilar({
              objectID,
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
            }),
          state.removeParams(this.$$id!)
        );
      },
    };

    // casting to avoid large type output
    return widget as LookingSimilarWidget;
  };
} satisfies LookingSimilarConnector;
