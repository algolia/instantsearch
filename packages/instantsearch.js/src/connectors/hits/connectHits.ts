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
} from '../../types';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true,
});

type Banner = NonNullable<
  NonNullable<
    Required<SearchResults<Hit>['renderingContent']>
  >['widgets']['banners']
>[number];

export type HitsRenderState<THit extends BaseHit = BaseHit> = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Array<Hit<THit>>;

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

export type HitsConnectorParams<THit extends BaseHit = BaseHit> = {
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

export type HitsWidgetDescription<THit extends BaseHit = BaseHit> = {
  $$type: 'ais.hits';
  renderState: HitsRenderState<THit>;
  indexRenderState: {
    hits: WidgetRenderState<HitsRenderState<THit>, HitsConnectorParams<THit>>;
  };
};

export type HitsConnector<THit extends BaseHit = BaseHit> = Connector<
  HitsWidgetDescription<THit>,
  HitsConnectorParams<THit>
>;

const connectHits: HitsConnector = function connectHits(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
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

        renderState.sendEvent('view:internal', renderState.hits);
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
            getIndex: () => helper.getIndex(),
            widgetType: this.$$type,
          });
        }

        if (!bindEvent) {
          bindEvent = createBindEventForHits({
            getIndex: () => helper.getIndex(),
            widgetType: this.$$type,
            instantSearchInstance,
          });
        }

        if (!results) {
          return {
            hits: [],
            results: undefined,
            banner: undefined,
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
          hitsWithAbsolutePositionAndQueryID,
          { results }
        );

        const banner = results.renderingContent?.widgets?.banners?.[0];

        return {
          hits: transformedHits,
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

      getWidgetSearchParameters(state) {
        if (!escapeHTML) {
          return state;
        }

        // @MAJOR: set this globally, not in the Hits widget to allow Hits to be conditionally used
        return state.setQueryParameters(TAG_PLACEHOLDER);
      },
    };
  };
};

export default connectHits;
