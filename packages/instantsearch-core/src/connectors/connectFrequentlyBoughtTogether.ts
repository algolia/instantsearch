import {
  createDocumentationMessageGenerator,
  noop,
  escapeHits,
  TAG_PLACEHOLDER,
} from '../lib/public';
import {
  createSendEventForHits,
  addAbsolutePosition,
  addQueryID,
  checkRendering,
} from '../lib/utils';

import type {
  Connector,
  TransformItems,
  BaseHit,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  RecommendResponse,
  AlgoliaHit,
  Widget,
  SendEventForHits,
} from '../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequently-bought-together',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState<
  THit extends NonNullable<object> = BaseHit
> = {
  /**
   * The matched recommendations from Algolia API.
   */
  items: Array<AlgoliaHit<THit>>;

  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;
};

export type FrequentlyBoughtTogetherConnectorParams<
  THit extends NonNullable<object> = BaseHit
> = {
  /**
   * The objectIDs of the items to get the frequently bought together items for.
   */
  objectIDs: string[];

  /**
   * Threshold for the recommendations confidence score (between 0 and 100). Only recommendations with a greater score are returned.
   */
  threshold?: number;

  /**
   * The maximum number of recommendations to return.
   */
  limit?: number;

  /**
   * Parameters to pass to the request.
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

export type FrequentlyBoughtTogetherWidgetDescription<
  THit extends NonNullable<object> = BaseHit
> = {
  $$type: 'ais.frequentlyBoughtTogether';
  renderState: FrequentlyBoughtTogetherRenderState<THit>;
};

export type FrequentlyBoughtTogetherConnector<
  THit extends NonNullable<object> = BaseHit
> = Connector<
  FrequentlyBoughtTogetherWidgetDescription<THit>,
  FrequentlyBoughtTogetherConnectorParams<THit>
>;

export const connectFrequentlyBoughtTogether =
  function connectFrequentlyBoughtTogether<
    TWidgetParams extends UnknownWidgetParams
  >(
    renderFn: Renderer<
      FrequentlyBoughtTogetherRenderState,
      TWidgetParams & FrequentlyBoughtTogetherConnectorParams
    >,
    unmountFn: Unmounter = noop
  ) {
    checkRendering(renderFn, withUsage());

    return <THit extends NonNullable<object> = BaseHit>(
      widgetParams: TWidgetParams &
        FrequentlyBoughtTogetherConnectorParams<THit>
    ) => {
      const {
        // @MAJOR: this can default to false
        escapeHTML = true,
        transformItems = ((items) => items) as NonNullable<
          FrequentlyBoughtTogetherConnectorParams<THit>['transformItems']
        >,
        objectIDs,
        limit,
        threshold,
        queryParameters,
      } = widgetParams || {};

      if (!objectIDs || objectIDs.length === 0) {
        throw new Error(withUsage('The `objectIDs` option is required.'));
      }

      type FrequentlyBoughtTogetherWidget = Widget<
        FrequentlyBoughtTogetherWidgetDescription<THit> & {
          widgetParams: typeof widgetParams;
        }
      >;

      let sendEvent: SendEventForHits;

      const widget: FrequentlyBoughtTogetherWidget = {
        dependsOn: 'recommend',
        $$type: 'ais.frequentlyBoughtTogether',

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

        dispose() {
          unmountFn();
        },

        getWidgetParameters(state) {
          return objectIDs.reduce(
            (acc, objectID) =>
              acc.addFrequentlyBoughtTogether({
                objectID,
                threshold,
                maxRecommendations: limit,
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
      return widget as FrequentlyBoughtTogetherWidget;
    };
  } satisfies FrequentlyBoughtTogetherConnector;