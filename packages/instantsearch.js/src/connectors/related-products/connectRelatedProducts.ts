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
  name: 'related-products',
  connector: true,
});

export type RelatedProductsRenderState<THit extends BaseHit = BaseHit> = {
  /**
   * The matched recommendations from the Algolia API.
   */
  recommendations: Array<Hit<THit>>;
};

export type RelatedProductsConnectorParams<THit extends BaseHit = BaseHit> = {
  /**
   * The `objectID` of the item to get related products from.
   */
  objectID: string;
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

export type RelatedProductsWidgetDescription<THit extends BaseHit = BaseHit> = {
  $$type: 'ais.relatedProducts';
  renderState: RelatedProductsRenderState<THit>;
};

export type RelatedProductsConnector<THit extends BaseHit = BaseHit> =
  Connector<
    RelatedProductsWidgetDescription<THit>,
    RelatedProductsConnectorParams<THit>
  >;

const connectRelatedProducts: RelatedProductsConnector =
  function connectRelatedProducts(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return function relatedProducts(widgetParams) {
      const {
        objectID,
        maxRecommendations,
        threshold,
        fallbackParameters,
        queryParameters,
        transformItems = ((items) => items) as NonNullable<
          RelatedProductsConnectorParams['transformItems']
        >,
      } = widgetParams || {};

      if (!objectID) {
        throw new Error(withUsage('The `objectID` option is required.'));
      }

      return {
        dependsOn: 'recommend',
        $$type: 'ais.relatedProducts',

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
          return state.addRelatedProducts({
            objectID,
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

export default connectRelatedProducts;
