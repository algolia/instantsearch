import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
} from '../../lib/utils';

import type { Connector, TransformItems, Hit, BaseHit } from '../../types';
import type {
  PlainSearchParameters,
  RecommendResultItem,
} from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequently-bought-together',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState<
  THit extends BaseHit = BaseHit
> = {
  /**
   * The matched recommendations from Algolia API.
   */
  recommendations: Array<Hit<THit>>;
};

export type FrequentlyBoughtTogetherConnectorParams<
  THit extends BaseHit = BaseHit
> = {
  /**
   * The objectIDs of the items to get the frequently bought together items for.
   */
  objectIDs: string[];

  /**
   * Threshold for the recommendations confidence score (between 0 and 100). Only recommendations with a greater score are returned.
   */
  threshold?: number;

  /**
   * The maximum number of recommendations to return.
   */
  maxRecommendations?: number;

  /**
   * Parameters to pass to the request.
   */
  queryParameters?: Omit<
    PlainSearchParameters,
    'page' | 'hitsPerPage' | 'offset' | 'length'
  >;

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<Hit<THit>, { results: RecommendResultItem }>;
};

export type FrequentlyBoughtTogetherWidgetDescription<
  THit extends BaseHit = BaseHit
> = {
  $$type: 'ais.frequentlyBoughtTogether';
  renderState: FrequentlyBoughtTogetherRenderState<THit>;
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
      const {
        transformItems = ((items) => items) as NonNullable<
          FrequentlyBoughtTogetherConnectorParams['transformItems']
        >,
        objectIDs,
        maxRecommendations,
        threshold,
        queryParameters,
      } = widgetParams || {};

      if (!objectIDs || objectIDs.length === 0) {
        throw new Error(withUsage('The `objectIDs` option is required.'));
      }

      return {
        dependsOn: 'recommend',
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

        render(renderOptions) {
          const renderState = this.getWidgetRenderState(renderOptions);

          renderFn(
            {
              ...renderState,
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
        },

        getRenderState(renderState) {
          return renderState;
        },

        getWidgetRenderState({ results }) {
          if (results === null || results === undefined) {
            return { recommendations: [], widgetParams };
          }

          const transformedItems = transformItems(results.hits, {
            results: results as RecommendResultItem,
          });

          return { recommendations: transformedItems, widgetParams };
        },

        dispose({ state }) {
          unmountFn();

          return state;
        },

        getWidgetParameters(state) {
          // We only use the first objectID to get the recommendations for
          // until we implement support for multiple objectIDs in the helper.
          const objectID = objectIDs[0];
          return state.addFrequentlyBoughtTogether({
            objectID,
            threshold,
            maxRecommendations,
            queryParameters,
            $$id: this.$$id!,
          });
        },
      };
    };
  };

export default connectFrequentlyBoughtTogether;
