import type {
  SendEventForHits,
  BindEventForHits,
} from '../../lib/utils/index.js';
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
} from '../../lib/utils/index.js';
import type {
  TransformItems,
  Connector,
  Hits,
  Hit,
  WidgetRenderState,
} from '../../types/index.js';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true,
});

export type HitsRenderState = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Hits;

  /**
   * The response from the Algolia API.
   */
  results?: SearchResults<Hit>;

  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: SendEventForHits;

  /**
   * Returns a string for the `data-insights-event` attribute for the Insights middleware
   */
  bindEvent: BindEventForHits;
};

export type HitsConnectorParams = {
  /**
   * Whether to escape HTML tags from hits string values.
   *
   * @default true
   */
  escapeHTML?: boolean;

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<Hit>;
};

export type HitsWidgetDescription = {
  $$type: 'ais.hits';
  renderState: HitsRenderState;
  indexRenderState: {
    hits: WidgetRenderState<HitsRenderState, HitsConnectorParams>;
  };
};

export type HitsConnector = Connector<
  HitsWidgetDescription,
  HitsConnectorParams
>;

const connectHits: HitsConnector = function connectHits(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      escapeHTML = true,
      transformItems = ((items) => items) as TransformItems<Hit>,
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
        renderState.sendEvent('view', renderState.hits);

        renderFn(
          {
            ...renderState,
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          hits: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results, helper, instantSearchInstance }) {
        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            index: helper.getIndex(),
            widgetType: this.$$type,
          });
        }

        if (!bindEvent) {
          bindEvent = createBindEventForHits({
            index: helper.getIndex(),
            widgetType: this.$$type,
          });
        }

        if (!results) {
          return {
            hits: [],
            results: undefined,
            sendEvent,
            bindEvent,
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

        const transformedHits = transformItems(
          hitsWithAbsolutePositionAndQueryID
        );

        return {
          hits: transformedHits,
          results,
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

      getWidgetSearchParameters(state) {
        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(TAG_PLACEHOLDER);
      },
    };
  };
};

export default connectHits;
