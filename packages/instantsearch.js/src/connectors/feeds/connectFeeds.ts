import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type { Connector } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'feeds',
  connector: true,
});

export type FeedsRenderState = {
  feedIDs: string[];
};

export type FeedsConnectorParams = {
  /**
   * Explicit search scope. Currently only 'global' is supported
   * (future-proofing for per-feed search parameters).
   */
  searchScope: 'global';

  /**
   * Optional: transform/reorder/filter feed IDs before rendering.
   */
  transformFeeds?: (feeds: string[]) => string[];
};

export type FeedsWidgetDescription = {
  $$type: 'ais.feeds';
  renderState: FeedsRenderState;
  indexRenderState: {
    feeds: FeedsRenderState;
  };
};

export type FeedsConnector = Connector<
  FeedsWidgetDescription,
  FeedsConnectorParams
>;

const connectFeeds: FeedsConnector = function connectFeeds(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const { searchScope, transformFeeds = (feeds) => feeds } = widgetParams;

    if (searchScope !== 'global') {
      throw new Error(
        withUsage('The `searchScope` option currently only supports "global".')
      );
    }

    return {
      $$type: 'ais.feeds',
      $$widgetType: 'ais.feeds',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        if (!instantSearchInstance.compositionID) {
          throw new Error(
            withUsage(
              'The `feeds` widget requires a composition-based InstantSearch instance (compositionID must be set).'
            )
          );
        }

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

      getWidgetSearchParameters(state) {
        return state;
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          feeds: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results }) {
        if (!results) {
          return { feedIDs: [], widgetParams };
        }

        let feedIDs = results.feeds
          ? results.feeds.map((f: { feedID: string }) => f.feedID)
          : [''];

        feedIDs = transformFeeds(feedIDs);

        if (!Array.isArray(feedIDs)) {
          throw new Error(
            withUsage(
              'The `transformFeeds` option expects a function that returns an Array.'
            )
          );
        }

        if (!feedIDs.every((feedID: string) => typeof feedID === 'string')) {
          throw new Error(
            withUsage(
              'The `transformFeeds` option expects a function that returns an array of feed IDs (strings).'
            )
          );
        }

        return { feedIDs, widgetParams };
      },
    };
  };
};

export default connectFeeds;
