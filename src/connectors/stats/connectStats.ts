import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Connector, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'stats',
  connector: true,
});

/**
 * **Stats** connector provides the logic to build a custom widget that will displays
 * search statistics (hits number and processing time).
 */

export type StatsRenderState = {
  /**
   * The maximum number of hits per page returned by Algolia.
   */
  hitsPerPage?: number;
  /**
   * The number of hits in the result set.
   */
  nbHits: number;
  /**
   * The number of sorted hits in the result set (when using Relevant sort).
   */
  nbSortedHits?: number;
  /**
   * Indicates whether the index is currently using Relevant sort and is displaying only sorted hits.
   */
  areHitsSorted: boolean;
  /**
   * The number of pages computed for the result set.
   */
  nbPages: number;
  /**
   * The current page.
   */
  page: number;
  /**
   * The time taken to compute the results inside the Algolia engine.
   */
  processingTimeMS: number;
  /**
   * The query used for the current search.
   */
  query: string;
};

export type StatsConnectorParams = Record<string, unknown>;

export type StatsWidgetDescription = {
  $$type: 'ais.stats';
  renderState: StatsRenderState;
  indexRenderState: {
    stats: WidgetRenderState<StatsRenderState, StatsConnectorParams>;
  };
};

export type StatsConnector = Connector<
  StatsWidgetDescription,
  StatsConnectorParams
>;

const connectStats: StatsConnector = function connectStats(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => ({
    $$type: 'ais.stats',

    init(initOptions) {
      const { instantSearchInstance } = initOptions;

      renderFn(
        {
          ...this.getWidgetRenderState(initOptions),
          instantSearchInstance,
        },
        true
      );
    },

    render(renderOptions) {
      const { instantSearchInstance } = renderOptions;

      renderFn(
        {
          ...this.getWidgetRenderState(renderOptions),
          instantSearchInstance,
        },
        false
      );
    },

    dispose() {
      unmountFn();
    },

    getRenderState(renderState, renderOptions) {
      return {
        ...renderState,
        stats: this.getWidgetRenderState(renderOptions),
      };
    },

    getWidgetRenderState({ results, helper }) {
      if (!results) {
        return {
          hitsPerPage: helper.state.hitsPerPage,
          nbHits: 0,
          nbSortedHits: undefined,
          areHitsSorted: false,
          nbPages: 0,
          page: helper.state.page || 0,
          processingTimeMS: -1,
          query: helper.state.query || '',
          widgetParams,
        };
      }

      return {
        hitsPerPage: results.hitsPerPage,
        nbHits: results.nbHits,
        nbSortedHits: results.nbSortedHits,
        areHitsSorted:
          typeof results.appliedRelevancyStrictness !== 'undefined' &&
          results.appliedRelevancyStrictness > 0 &&
          results.nbSortedHits !== results.nbHits,
        nbPages: results.nbPages,
        page: results.page,
        processingTimeMS: results.processingTimeMS,
        query: results.query,
        widgetParams,
      };
    },
  });
};

export default connectStats;
