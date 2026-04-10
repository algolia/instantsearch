import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import { createFeedContainer } from './FeedContainer';

import type { Connector, IndexWidget, Widget } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'feeds',
  connector: true,
});

export type FeedsRenderState = {
  feeds: Array<{ feedID: string; container: IndexWidget }>;
};

export type FeedsConnectorParams = {
  /**
   * Returns widgets for a given feed. Called once per feedID.
   */
  widgets: (feedID: string) => Array<Widget>;

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
    const {
      widgets,
      searchScope,
      transformFeeds = (feeds) => feeds,
    } = widgetParams;

    if (typeof widgets !== 'function') {
      throw new Error(withUsage('The `widgets` option expects a function.'));
    }

    if (searchScope !== 'global') {
      throw new Error(
        withUsage('The `searchScope` option currently only supports "global".')
      );
    }

    // Map of feedID → FeedContainer (IndexWidget)
    const feedContainers = new Map<string, IndexWidget>();

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
        const { results, parent, instantSearchInstance } = renderOptions;

        if (!results) {
          renderFn(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance,
            },
            false
          );
          return;
        }

        // Single-feed backward compat: when no feeds are present in response,
        // treat it as one anonymous feed without mutating the SearchResults.
        let feedIDs = results.feeds ? results.feeds.map((f) => f.feedID) : [''];
        feedIDs = transformFeeds(feedIDs);

        if (!Array.isArray(feedIDs)) {
          throw new Error(
            withUsage(
              'The `transformFeeds` option expects a function that returns an Array.'
            )
          );
        }

        if (!feedIDs.every((feedID) => typeof feedID === 'string')) {
          throw new Error(
            withUsage(
              'The `transformFeeds` option expects a function that returns an array of feed IDs (strings).'
            )
          );
        }

        const activeFeedIDs = new Set(feedIDs);

        // Remove containers for feeds that no longer exist
        const containersToRemove: IndexWidget[] = [];
        feedContainers.forEach((container, id) => {
          if (!activeFeedIDs.has(id)) {
            containersToRemove.push(container);
            feedContainers.delete(id);
          }
        });
        if (containersToRemove.length > 0) {
          // Deferred removal — same pattern as connectDynamicWidgets
          setTimeout(() => parent.removeWidgets(containersToRemove), 0);
        }

        // Create containers for new feeds, render them immediately
        // (existing containers are rendered by the parent's render cycle)
        feedIDs.forEach((feedID) => {
          if (!feedContainers.has(feedID)) {
            const feedWidgets = widgets(feedID);
            if (!feedWidgets || feedWidgets.length === 0) {
              return;
            }
            const container = createFeedContainer(
              feedID,
              parent,
              instantSearchInstance
            );
            feedContainers.set(feedID, container);
            parent.addWidgets([container]);
            container.addWidgets(feedWidgets);
            container.render(renderOptions);
          }
        });

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ parent }) {
        const toRemove = Array.from(feedContainers.values());
        feedContainers.clear();
        parent.removeWidgets(toRemove);
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

      getWidgetRenderState() {
        const feeds = Array.from(feedContainers.entries()).map(
          ([feedID, container]) => ({ feedID, container })
        );

        return {
          feeds,
          widgetParams,
        };
      },
    };
  };
};

export default connectFeeds;
