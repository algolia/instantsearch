import {
  createDocumentationMessageGenerator,
  checkRendering,
  noop,
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
  Hit,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-facets',
  connector: true,
});

export type TrendingFacetHit = {
  objectID: string;
  /**
   * Recommendation score.
   */
  _score: number;
  /**
   * The attribute of this trending facet.
   */
  attribute: string;
  /**
   * The value of this trending facet.
   */
  value: string;
};

export type TrendingFacetsRenderState = {
  /**
   * The matched recommendations from the Algolia API.
   */
  items: Array<Hit<TrendingFacetHit>>;
};

export type TrendingFacetsConnectorParams = {
  /**
   * The facet attribute to get recommendations for.
   */
  attribute: string;
  /**
   * The number of recommendations to retrieve.
   */
  limit?: number;
  /**
   * The threshold for the recommendations confidence score (between 0 and 100).
   */
  threshold?: number;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<
    Hit<TrendingFacetHit>,
    { results: RecommendResponse<Hit<TrendingFacetHit>> }
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
      attribute,
      limit,
      threshold,
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

        const renamed = results.hits.map((hit) => ({
          objectID: `${hit.facetName}:${hit.facetValue}`,
          _score: hit._score,
          attribute: hit.facetName,
          value: hit.facetValue,
        }));

        const itemsWithAbsolutePosition = addAbsolutePosition(renamed, 0, 1);

        const itemsWithAbsolutePositionAndQueryID = addQueryID(
          itemsWithAbsolutePosition,
          results.queryID
        );

        const transformedItems = transformItems(
          itemsWithAbsolutePositionAndQueryID as unknown as Array<
            Hit<TrendingFacetHit>
          >,
          {
            results: results as RecommendResponse<Hit<TrendingFacetHit>>,
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
          facetName: attribute,
          maxRecommendations: limit,
          threshold,
          $$id: this.$$id!,
        });
      },
    };
  };
} satisfies TrendingFacetsConnector);
