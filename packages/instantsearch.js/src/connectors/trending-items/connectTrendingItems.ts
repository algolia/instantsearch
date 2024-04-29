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
  name: 'trending-items',
  connector: true,
});

export type TrendingItemsRenderState<THit extends BaseHit = BaseHit> = {
  /**
   * The matched recommendations from the Algolia API.
   */
  recommendations: Array<Hit<THit>>;
};

export type TrendingItemsConnectorParams<THit extends BaseHit = BaseHit> = {
  /**
   * The facet attribute to get recommendations for.
   */
  facetName?: string;
  /**
   * The facet value to get recommendations for.
   */
  facetValue?: string;
  /**
   * The number of recommendations to retrieve.
   */
  maxRecommendations?: number;
  /**
   * The threshold for the recommendations confidence score (between 0 and 100).
   */
  threshold?: number;
  /**
   * List of search parameters to send.
   */
  fallbackParameters?: Omit<
    PlainSearchParameters,
    'page' | 'hitsPerPage' | 'offset' | 'length'
  >;
  /**
   * List of search parameters to send.
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

export type TrendingItemsWidgetDescription<THit extends BaseHit = BaseHit> = {
  $$type: 'ais.trendingItems';
  renderState: TrendingItemsRenderState<THit>;
};

export type TrendingItemsConnector<THit extends BaseHit = BaseHit> = Connector<
  TrendingItemsWidgetDescription<THit>,
  TrendingItemsConnectorParams<THit>
>;

const connectTrendingItems: TrendingItemsConnector =
  function connectTrendingItems(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return function trendingItems(widgetParams) {
      const {
        facetName,
        facetValue,
        maxRecommendations,
        threshold,
        fallbackParameters,
        queryParameters,
        transformItems = ((items) => items) as NonNullable<
          TrendingItemsConnectorParams['transformItems']
        >,
      } = widgetParams || {};

      return {
        dependsOn: 'recommend',
        $$type: 'ais.trendingItems',

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

          return {
            recommendations: transformItems(results.hits, {
              results: results as RecommendResultItem,
            }),
            widgetParams,
          };
        },

        dispose({ state }) {
          unmountFn();

          return state;
        },

        getWidgetParameters(state) {
          return state.addTrendingItems({
            facetName,
            facetValue,
            maxRecommendations,
            threshold,
            fallbackParameters,
            queryParameters,
            $$id: this.$$id!,
          });
        },
      };
    };
  };

export default connectTrendingItems;
