import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
  escapeHits,
  addAbsolutePosition,
  addQueryID,
} from '../../lib/utils';

import type {
  Connector,
  TransformItems,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  RecommendResponse,
  TrendingFacetHit,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-facets',
  connector: true,
});

export type TrendingFacetsRenderState = {
  /**
   * The matched recommendations from the Algolia API.
   */
  items: TrendingFacetHit[];
};

export type TrendingFacetsConnectorParams = {
  /**
   * The facet attribute to get recommendations for.
   */
  facetName: string;
} & {
  /**
   * The number of recommendations to retrieve.
   */
  limit?: number;
  /**
   * The threshold for the recommendations confidence score (between 0 and 100).
   */
  threshold?: number;

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
    TrendingFacetHit,
    { results: RecommendResponse<TrendingFacetHit> }
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
      // @MAJOR: this can default to false
      escapeHTML = true,
      transformItems = ((items) => items) as NonNullable<
        TrendingFacetsConnectorParams['transformItems']
      >,
    } = widgetParams || {};

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

      getWidgetRenderState({ results }) {
        if (results === null || results === undefined) {
          return { items: [], widgetParams };
        }

        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        const itemsWithAbsolutePosition = addAbsolutePosition(
          results.hits,
          0,
          1
        );

        const itemsWithAbsolutePositionAndQueryID = addQueryID(
          itemsWithAbsolutePosition,
          results.queryID
        );

        const transformedItems = transformItems(
          itemsWithAbsolutePositionAndQueryID as TrendingFacetHit[],
          {
            results: results as RecommendResponse<TrendingFacetHit>,
          }
        );

        return {
          items: transformedItems,
          widgetParams,
        };
      },

      dispose({ recommendState }) {
        unmountFn();
        return recommendState.removeParams(this.$$id!);
      },

      getWidgetParameters(state) {
        return state.removeParams(this.$$id!).addTrendingFacets({
          facetName,
          maxRecommendations: limit,
          threshold,
          $$id: this.$$id!,
        });
      },
    };
  };
} satisfies TrendingFacetsConnector);
