import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
  TAG_PLACEHOLDER,
} from '../../lib/utils';
import { escape } from '../../lib/utils/escape-html';

import type {
  Connector,
  TransformItems,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  RecommendResponse,
} from '../../types';
import type { TrendingFacetItem } from '../../types/recommend';
import type { PlainSearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-facets',
  connector: true,
});

export type TrendingFacetsRenderState = {
  /**
   * The trending facet values from the Algolia Recommend API.
   */
  items: TrendingFacetItem[];
};

export type TrendingFacetsConnectorParams = {
  /**
   * The facet attribute to get trending values for.
   */
  facetName: string;
  /**
   * The number of recommendations to retrieve.
   */
  limit?: number;
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
  transformItems?: TransformItems<
    TrendingFacetItem,
    { results: RecommendResponse<TrendingFacetItem> }
  >;
};

export type TrendingFacetsWidgetDescription = {
  $$type: 'ais.trendingFacets';
  renderState: TrendingFacetsRenderState;
};

export type TrendingFacetsConnector = Connector<
  TrendingFacetsWidgetDescription,
  TrendingFacetsConnectorParams
>;

export default (function connectTrendingFacets<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    TrendingFacetsRenderState,
    TWidgetParams & TrendingFacetsConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams: TWidgetParams & TrendingFacetsConnectorParams) => {
    const {
      facetName,
      limit,
      threshold,
      fallbackParameters,
      queryParameters,
      // @MAJOR: this can default to false
      escapeHTML = true,
      transformItems = ((items) => items) as NonNullable<
        TrendingFacetsConnectorParams['transformItems']
      >,
    } = widgetParams || {};

    if (!facetName) {
      throw new Error(
        withUsage('The `facetName` option is required.')
      );
    }

    return {
      dependsOn: 'recommend',
      $$type: 'ais.trendingFacets',

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

      getWidgetRenderState({ results, helper, instantSearchInstance }) {
        void helper;
        void instantSearchInstance;

        if (results === null || results === undefined) {
          return { items: [], widgetParams };
        }

        let items: TrendingFacetItem[] = (
          (results as RecommendResponse<any>).hits || []
        ).map((hit: any) => ({
          facetName: hit.facetName as string,
          facetValue: hit.facetValue as string,
          _score: hit._score as number,
        }));

        if (escapeHTML) {
          items = items.map((item) => ({
            ...item,
            facetValue: escape(item.facetValue),
          }));
        }

        items = transformItems(items, {
          results: results as RecommendResponse<TrendingFacetItem>,
        });

        return {
          items,
          widgetParams,
        };
      },

      dispose({ recommendState }) {
        unmountFn();
        return recommendState.removeParams(this.$$id!);
      },

      getWidgetParameters(state) {
        // v4 TrendingFacetsQuery doesn't include queryParameters or
        // fallbackParameters, but the v5 API and the helper support them.
        return state.removeParams(this.$$id!).addTrendingFacets({
          facetName,
          maxRecommendations: limit,
          threshold,
          fallbackParameters: fallbackParameters
            ? {
                ...fallbackParameters,
                ...(escapeHTML ? TAG_PLACEHOLDER : {}),
              }
            : undefined,
          queryParameters: {
            ...queryParameters,
            ...(escapeHTML ? TAG_PLACEHOLDER : {}),
          },
          $$id: this.$$id!,
        } as any);
      },
    };
  };
} satisfies TrendingFacetsConnector);
