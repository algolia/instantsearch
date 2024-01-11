import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
} from '../../lib/utils';

import type { SendEventForHits } from '../../lib/utils';
import type { Connector, Hit, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequentlyBoughtTogether',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState = {
  recommendations: Hit[];
  sendEvent: SendEventForHits;
};

export type FrequentlyBoughtTogetherConnectorParams = {
  objectIDs: string[];
};

export type FrequentlyBoughtTogetherWidgetDescription = {
  $$type: 'ais.frequentlyBoughtTogether';
  renderState: FrequentlyBoughtTogetherRenderState;
  indexRenderState: {
    frequentlyBoughtTogether: WidgetRenderState<
      FrequentlyBoughtTogetherRenderState,
      FrequentlyBoughtTogetherConnectorParams
    >;
  };
};

export type FrequentlyBoughtTogetherConnector = Connector<
  FrequentlyBoughtTogetherWidgetDescription,
  FrequentlyBoughtTogetherConnectorParams
>;

const connectFrequentlyBoughtTogether: FrequentlyBoughtTogetherConnector =
  function connectFrequentlyBoughtTogether(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    let lastRenderedResults: any = null;

    return (widgetParams) => {
      let sendEvent: SendEventForHits;
      const { objectIDs } = widgetParams || {};

      return {
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

        shouldRender(currentResults: any) {
          return lastRenderedResults !== currentResults;
        },

        render(renderOptions) {
          if (
            // @ts-ignore
            !this.shouldRender(
              renderOptions.instantSearchInstance.recommendResults
            )
          ) {
            return;
          }
          lastRenderedResults =
            renderOptions.instantSearchInstance.recommendResults;

          const renderState = this.getWidgetRenderState(renderOptions);

          renderFn(
            {
              ...renderState,
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );

          renderState.sendEvent('view:internal', renderState.recommendations);
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            frequentlyBoughtTogether: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState({ helper, instantSearchInstance, parent }) {
          if (!sendEvent) {
            sendEvent = createSendEventForHits({
              instantSearchInstance,
              index: helper.getIndex(),
              widgetType: this.$$type,
            });
          }

          return {
            recommendations: instantSearchInstance.recommendResults
              ? instantSearchInstance.recommendResults[objectIDs[0]]
              : [],
            sendEvent,
            widgetParams,
          };
        },

        dispose({ state }) {
          unmountFn();

          return state;
        },

        getWidgetSearchParameters(state) {
          return state;
        },

        getWidgetRecommendParameters(state: any) {
          return {
            ...state,
            frequentlyBoughtTogether: [
              ...state.frequentlyBoughtTogether,
              ...objectIDs,
            ],
          };
        },
      };
    };
  };

export default connectFrequentlyBoughtTogether;
