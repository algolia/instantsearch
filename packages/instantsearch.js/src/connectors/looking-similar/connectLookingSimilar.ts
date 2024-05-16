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
  name: 'looking-similar',
  connector: true,
});

export type LookingSimilarRenderState<THit extends BaseHit = BaseHit> = {
  /**
   * The matched recommendations from the Algolia API.
   */
  items: Array<Hit<THit>>;
};

export type LookingSimilarConnectorParams<THit extends BaseHit = BaseHit> = {
  /**
   * The `objectIDs` of the items to get similar looking products from.
   */
  objectIDs: string[];
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

export type LookingSimilarWidgetDescription<THit extends BaseHit = BaseHit> = {
  $$type: 'ais.lookingSimilar';
  renderState: LookingSimilarRenderState<THit>;
};

export type LookingSimilarConnector<THit extends BaseHit = BaseHit> = Connector<
  LookingSimilarWidgetDescription<THit>,
  LookingSimilarConnectorParams<THit>
>;

const connectLookingSimilar: LookingSimilarConnector =
  function connectLookingSimilar(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return function LookingSimilar(widgetParams) {
      const {
        // @MAJOR: this can default to false
        escapeHTML = true,
        objectIDs,
        maxRecommendations,
        threshold,
        fallbackParameters,
        queryParameters,
        transformItems = ((items) => items) as NonNullable<
          LookingSimilarConnectorParams['transformItems']
        >,
      } = widgetParams || {};

      if (!objectIDs || objectIDs.length === 0) {
        throw new Error(withUsage('The `objectIDs` option is required.'));
      }

      return {
        dependsOn: 'recommend',
        $$type: 'ais.lookingSimilar',

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
          return objectIDs.reduce(
            (acc, objectID) =>
              acc.addLookingSimilar({
                objectID,
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
              }),
            state.removeParams(this.$$id!)
          );
        },
      };
    };
  };

export default connectLookingSimilar;
