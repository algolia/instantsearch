import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
  escapeHits,
  TAG_PLACEHOLDER,
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
  items: Array<Hit<THit>>;
};

export type TrendingItemsConnectorParams<THit extends BaseHit = BaseHit> = (
  | {
      /**
       * The facet attribute to get recommendations for.
       */
      facetName: string;
      /**
       * The facet value to get recommendations for.
       */
      facetValue: string;
    }
  | { facetName?: never; facetValue?: never }
) & {
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
   * Whether to escape HTML tags from items string values.
   *
   * @default true
   */
  escapeHTML?: boolean;
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
        // @MAJOR: this can default to false
        escapeHTML = true,
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
            return { items: [], widgetParams };
          }

          if (escapeHTML && results.hits.length > 0) {
            results.hits = escapeHits(results.hits);
          }

          return {
            items: transformItems(results.hits, {
              results: results as RecommendResultItem,
            }),
            widgetParams,
          };
        },

        dispose({ recommendState }) {
          unmountFn();
          return recommendState.removeParams(this.$$id!);
        },

        getWidgetParameters(state) {
          return state.addTrendingItems({
            facetName,
            facetValue,
            maxRecommendations,
            threshold,
            fallbackParameters: {
              ...fallbackParameters,
              ...(escapeHTML ? TAG_PLACEHOLDER : {}),
            },
            queryParameters: {
              ...queryParameters,
              ...(escapeHTML ? TAG_PLACEHOLDER : {}),
            },
            $$id: this.$$id!,
          });
        },
      };
    };
  };

export default connectTrendingItems;
