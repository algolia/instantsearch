import { getFrequentlyBoughtTogether } from '@algolia/recommend-core';
import {
  SendEventForHits,
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
} from '../../lib/utils';

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

    return (widgetParams) => {
      let sendEvent: SendEventForHits;
      const { objectIDs } = widgetParams || {};

      let recommendations = [] as any[];

      return {
        $$type: 'ais.frequentlyBoughtTogether',

        init(initOptions) {
          const { state, instantSearchInstance } = initOptions;

          getFrequentlyBoughtTogether({
            objectIDs,
            recommendClient: instantSearchInstance.recommendClient,
            indexName: state.index,
          }).then(({ recommendations: _recommendations }) => {
            recommendations = _recommendations;

            renderFn(
              {
                ...this.getWidgetRenderState(initOptions),
                instantSearchInstance: initOptions.instantSearchInstance,
              },
              true
            );
          });

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
            recommendations,
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
      };
    };
  };

export default connectFrequentlyBoughtTogether;
