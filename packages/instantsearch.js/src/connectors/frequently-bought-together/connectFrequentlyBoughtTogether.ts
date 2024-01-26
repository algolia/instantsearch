import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
} from '../../lib/utils';

import type { RecommendHits } from '../../lib/RecommendHelper';
import type { SendEventForHits } from '../../lib/utils';
import type { Connector, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequentlyBoughtTogether',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState = {
  recommendations: RecommendHits;
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

        shouldRender(lastResults: any, currentResults: any) {
          return lastResults !== currentResults;
        },

        render(renderOptions) {
          if (
            // @ts-ignore
            !this.shouldRender(
              renderOptions.instantSearchInstance.recommendHelper.lastResults,
              renderOptions.instantSearchInstance.recommendHelper.currentResults
            )
          ) {
            return;
          }

          const renderState = this.getWidgetRenderState(renderOptions);

          renderFn(
            {
              ...renderState,
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );

          // @ts-ignore
          renderState.sendEvent('view:internal', renderState.recommendations);
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            frequentlyBoughtTogether: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState({ helper, instantSearchInstance }) {
          if (!sendEvent) {
            sendEvent = createSendEventForHits({
              instantSearchInstance,
              index: helper.getIndex(),
              widgetType: this.$$type,
            });
          }

          return {
            recommendations: instantSearchInstance.recommendHelper
              .currentResults
              ? instantSearchInstance.recommendHelper.currentResults[
                  objectIDs[0]
                ]
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

        getWidgetRecommendParameters(state) {
          objectIDs.forEach((objectID) => {
            state.frequentlyBoughtTogether.add(objectID);
          });

          return state;
        },
      };
    };
  };

export default connectFrequentlyBoughtTogether;
