//@ts-nocheck

import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
} from '../../lib/utils';

import type { RecommendHits } from '../../lib/RecommendHelper';
import type { SendEventForHits } from '../../lib/utils';
import type { Connector, WidgetRenderState } from '../../types';
import { createConnector } from '../../lib/createConnector';

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

let sendEvent: SendEventForHits;

const connectFrequentlyBoughtTogether = createConnector<
  FrequentlyBoughtTogetherWidgetDescription,
  FrequentlyBoughtTogetherConnectorParams
>((widgetParams) => {
  const { objectIDs } = widgetParams || {};

  return {
    name: 'frequentlyBoughtTogether',
    dependsOn: 'recommend',
    getWidgetParameters(state) {
      objectIDs.forEach((objectID) => {
        state.frequentlyBoughtTogether.add(objectID);
      });

      return state;
    },

    getWidgetRenderState({ helper, instantSearchInstance }) {
      if (!sendEvent) {
        sendEvent = createSendEventForHits({
          instantSearchInstance,
          index: helper.getIndex(),
          widgetType: 'ais.frequentlyBoughtTogether', // this.$$type,
        });
      }

      return {
        recommendations: instantSearchInstance.recommendHelper.currentResults
          ? instantSearchInstance.recommendHelper.currentResults[objectIDs[0]]
          : [],
        sendEvent,
        widgetParams,
      };
    },

    shouldRender({ instantSearchInstance }) {
      const { lastResults, currentResults } =
        instantSearchInstance.recommendHelper;

      return lastResults !== currentResults;
    },
  };
});

export default connectFrequentlyBoughtTogether;
