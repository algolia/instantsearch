import { getFrequentlyBoughtTogether } from '@algolia/recommend-core';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type { Connector, Hit, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequentlyBoughtTogether',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState = {
  recommendations: Hit[];
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
          renderFn(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            frequentlyBoughtTogether: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState() {
          return {
            recommendations,
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
