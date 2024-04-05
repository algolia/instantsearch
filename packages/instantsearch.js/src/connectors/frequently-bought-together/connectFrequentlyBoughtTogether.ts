import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  WidgetRenderState,
  TransformItems,
  Hit,
  BaseHit,
  RenderOptions,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequentlyBoughtTogether',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState<
  THit extends BaseHit = BaseHit
> = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Array<Hit<THit>>; // To do something with types here ?

  /**
   * The response from the Algolia API.
   */
  // results?: SearchResults<Hit<THit>>;

  /**
   * Sends an event to the Insights middleware.
   */
  // sendEvent: SendEventForHits;

  /**
   * Returns a string for the `data-insights-event` attribute for the Insights middleware
   */
  // bindEvent: BindEventForHits;
};

export type FrequentlyBoughtTogetherConnectorParams<
  THit extends BaseHit = BaseHit
> = {
  /**
   * The objectID of the item to get the frequently bought together items.
   */
  objectID: string;
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

export type FrequentlyBoughtTogetherWidgetDescription<
  THit extends BaseHit = BaseHit
> = {
  $$type: 'ais.frequentlyBoughtTogether';
  renderState: FrequentlyBoughtTogetherRenderState<THit>;
  indexRenderState: {
    // Why is this here?
    fbt: WidgetRenderState<
      FrequentlyBoughtTogetherRenderState<THit>,
      FrequentlyBoughtTogetherConnectorParams<THit>
    >;
  };
};

export type FrequentlyBoughtTogetherConnector<THit extends BaseHit = BaseHit> =
  Connector<
    FrequentlyBoughtTogetherWidgetDescription<THit>,
    FrequentlyBoughtTogetherConnectorParams<THit>
  >;

const connectFrequentlyBoughtTogether: FrequentlyBoughtTogetherConnector =
  function connectFrequentlyBoughtTogether(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      return {
        dependsOn: 'recommend',
        $$type: 'ais.frequentlyBoughtTogether',
        $$id: 123456789, // to do: generate a unique id

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

          // renderState.sendEvent('view:internal', renderState.hits);
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            fbt: this.getWidgetRenderState(renderOptions as RenderOptions),
          };
        },

        getWidgetRenderState({ results }) {
          if (results === null || results === undefined) {
            return { hits: [], widgetParams };
          }

          return { hits: results.hits, widgetParams };
        },

        dispose({ state }) {
          unmountFn();

          return state;
        },

        getWidgetParameters(state) {
          return state.addFrequentlyBoughtTogether({
            $$id: 123456789,
            objectID: widgetParams.objectID,
          });
        },
      };
    };
  };

export default connectFrequentlyBoughtTogether;
