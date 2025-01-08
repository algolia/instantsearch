import {
  createDocumentationMessageGenerator,
  noop,
  escapeHits,
  TAG_PLACEHOLDER,
} from '../lib/public';
import {
  checkRendering,
  addAbsolutePosition,
  addQueryID,
  createSendEventForHits,
} from '../lib/utils';

import type {
  TransformItems,
  Connector,
  Hit,
  WidgetRenderState,
  BaseHit,
  Unmounter,
  Renderer,
  SendEventForHits,
  Widget,
} from '../types';
import type { Banner, SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true,
});

export type HitsRenderState<THit extends NonNullable<object> = BaseHit> = {
  /**
   * The matched hits from Algolia API.
   */
  items: Array<Hit<THit>>;

  /**
   * The response from the Algolia API.
   */
  results?: SearchResults<Hit<THit>>;

  /**
   * The banner to display above the hits.
   */
  banner?: Banner;

  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;
};

export type HitsConnectorParams<THit extends NonNullable<object> = BaseHit> = {
  /**
   * Whether to escape HTML tags from hits string values.
   *
   * @default true
   */
  escapeHTML?: boolean;

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<Hit<THit>>;
};

export type HitsWidgetDescription<THit extends NonNullable<object> = BaseHit> =
  {
    $$type: 'ais.hits';
    renderState: HitsRenderState<THit>;
    indexRenderState: {
      hits: WidgetRenderState<HitsRenderState<THit>, HitsConnectorParams<THit>>;
    };
  };

export type HitsConnector<THit extends NonNullable<object> = BaseHit> =
  Connector<HitsWidgetDescription<THit>, HitsConnectorParams<THit>>;

export const connectHits = function connectHits<TWidgetParams>(
  renderFn: Renderer<HitsRenderState, TWidgetParams & HitsConnectorParams>,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <THit extends NonNullable<object> = BaseHit>(
    widgetParams: TWidgetParams & HitsConnectorParams<THit>
  ) => {
    const {
      // @MAJOR: this can default to false
      escapeHTML = true,
      transformItems = ((items) => items) as NonNullable<
        HitsConnectorParams<THit>['transformItems']
      >,
    } = (widgetParams || {}) as HitsConnectorParams<THit>;
    let sendEvent: SendEventForHits;

    type HitsWidget = Widget<
      HitsWidgetDescription<THit> & {
        widgetParams: typeof widgetParams;
      }
    >;

    const widget: HitsWidget = {
      $$type: 'ais.hits',

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

        renderState.sendEvent('view:internal', renderState.items);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          hits: this.getWidgetRenderState(renderOptions) as NonNullable<
            typeof renderState['hits']
          >,
        };
      },

      getWidgetRenderState({ results, helper, instantSearchInstance }) {
        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            getIndex: () => helper.getIndex(),
            widgetType: this.$$type,
          });
        }

        if (!results) {
          return {
            items: [],
            results: undefined,
            banner: undefined,
            sendEvent,
            widgetParams,
          };
        }

        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        const hitsWithAbsolutePosition = addAbsolutePosition(
          results.hits,
          results.page,
          results.hitsPerPage
        );

        const hitsWithAbsolutePositionAndQueryID = addQueryID(
          hitsWithAbsolutePosition,
          results.queryID
        );

        const items = transformItems(hitsWithAbsolutePositionAndQueryID, {
          results,
        });

        const banner = results.renderingContent?.widgets?.banners?.[0];

        return {
          items,
          results,
          banner,
          sendEvent,
          widgetParams,
        };
      },

      dispose() {
        unmountFn();
      },

      getWidgetSearchParameters(state, _uiState) {
        if (!escapeHTML) {
          return state;
        }

        // @MAJOR: set this globally, not in the Hits widget to allow Hits to be conditionally used
        return state.setQueryParameters(TAG_PLACEHOLDER);
      },
    };

    // casting to avoid large type output
    return widget as HitsWidget;
  };
} satisfies HitsConnector;
