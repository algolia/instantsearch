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
  name: 'frequently-bought-together',
  connector: true,
});

export type FrequentlyBoughtTogetherRenderState<
  THit extends BaseHit = BaseHit
> = {
  /**
   * The matched recommendations from Algolia API.
   */
  items: Array<Hit<THit>>;
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
        // @MAJOR: this can default to false
        escapeHTML = true,
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
            return { items: [], widgetParams };
          }

          if (escapeHTML && results.hits.length > 0) {
            results.hits = escapeHits(results.hits);
          }

          const transformedItems = transformItems(results.hits, {
            results: results as RecommendResultItem,
          });

          return { items: transformedItems, widgetParams };
        },

        dispose({ recommendState }) {
          unmountFn();
          return recommendState.removeParams(this.$$id!);
        },

        getWidgetParameters(state) {
          return objectIDs.reduce(
            (acc, objectID) =>
              acc.addFrequentlyBoughtTogether({
                objectID,
                threshold,
                maxRecommendations,
                queryParameters: {
                  ...queryParameters,
                  ...(escapeHTML ? TAG_PLACEHOLDER : {}),
                },
                $$id: this.$$id!,
              }),
            state
          );
        },
      };
    };
  };

export default connectFrequentlyBoughtTogether;
