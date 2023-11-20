import { mapToRecommendations } from '@algolia/recommend-core/dist/esm/utils';
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

          const queries = objectIDs.map((objectID) => ({
            indexName: state.index,
            objectID,
          }));

          instantSearchInstance.recommendClient
            .getFrequentlyBoughtTogether(queries)
            .then((response: any) =>
              mapToRecommendations({
                hits: response.results.map((result: any) => result.hits),
                nrOfObjs: objectIDs.length,
              })
            )
            .then((hits: any[]) => {
              recommendations = hits;

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
