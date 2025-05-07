import {
  escapeHits,
  TAG_PLACEHOLDER,
  checkRendering,
  createDocumentationMessageGenerator,
  addAbsolutePosition,
  addQueryID,
  createSendEventForHits,
  createBindEventForHits,
  noop,
} from '../../lib/utils';

import type { SendEventForHits, BindEventForHits } from '../../lib/utils';
import type {
  TransformItems,
  Connector,
  Hit,
  WidgetRenderState,
  BaseHit,
  Unmounter,
  Renderer,
  IndexRenderState,
} from '../../types';
import type { Banner, SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true,
});

export type HitsRenderState<THit extends NonNullable<object> = BaseHit> = {
  /**
   * The matched hits from Algolia API.
   * @deprecated use `items` instead
   */
  hits: Array<Hit<THit>>;

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

  /**
   * Returns a string for the `data-insights-event` attribute for the Insights middleware
   */
  bindEvent: BindEventForHits;
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

export default (function connectHits<TWidgetParams>(
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
        HitsConnectorParams['transformItems']
      >,
    } = widgetParams || {};
    let sendEvent: SendEventForHits;
    let bindEvent: BindEventForHits;

    return {
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

      getRenderState(
        renderState,
        renderOptions
        // Type is explicitly redefined, to avoid having the TWidgetParams type in the definition
      ): IndexRenderState & HitsWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          hits: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results, helper, instantSearchInstance }) {
        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            helper,
            widgetType: this.$$type,
          });
        }

        if (!bindEvent) {
          bindEvent = createBindEventForHits({
            helper,
            widgetType: this.$$type,
            instantSearchInstance,
          });
        }

        if (!results) {
          return {
            hits: [],
            items: [],
            results: undefined,
            banner: undefined,
            sendEvent,
            bindEvent,
            widgetParams,
          };
        }

        if (escapeHTML && results.hits?.length > 0) {
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
          hits: items,
          items,
          results,
          banner,
          sendEvent,
          bindEvent,
          widgetParams,
        };
      },

      dispose({ state }) {
        unmountFn();

        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(
          Object.keys(TAG_PLACEHOLDER).reduce(
            (acc, key) => ({
              ...acc,
              [key]: undefined,
            }),
            {}
          )
        );
      },

      getWidgetSearchParameters(state, _uiState) {
        if (!escapeHTML) {
          return state;
        }

        // @MAJOR: set this globally, not in the Hits widget to allow Hits to be conditionally used
        return state.setQueryParameters(TAG_PLACEHOLDER);
      },
    };
  };
} satisfies HitsConnector);
