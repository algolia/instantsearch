import connectFeeds from '../../connectors/feeds/connectFeeds';
import { createFeedContainer } from '../../connectors/feeds/FeedContainer';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';

import type {
  FeedsConnectorParams,
  FeedsWidgetDescription,
} from '../../connectors/feeds/connectFeeds';
import type {
  IndexWidget,
  RenderOptions,
  Widget,
  WidgetFactory,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'feeds',
});
const suit = component('Feeds');

export type FeedsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Returns widgets for a given feed. Called once per feedID.
   * The container is a DOM element scoped to this feed.
   */
  widgets: (container: HTMLElement, feedID: string) => Array<Widget>;
};

export type FeedsWidget = WidgetFactory<
  FeedsWidgetDescription & { $$widgetType: 'ais.feeds' },
  Omit<FeedsConnectorParams, 'transformFeeds'>,
  FeedsWidgetParams & Pick<FeedsConnectorParams, 'transformFeeds'>
>;

type FeedEntry = {
  feedContainer: IndexWidget;
  domElement: HTMLElement;
};

const feeds: FeedsWidget = function feeds(widgetParams) {
  const {
    container: containerSelector,
    widgets,
    transformFeeds,
    ...connectorParams
  } = widgetParams || {};

  if (!containerSelector) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (typeof widgets !== 'function') {
    throw new Error(withUsage('The `widgets` option expects a function.'));
  }

  const userContainer = getContainerNode(containerSelector);
  const rootContainer = document.createElement('div');
  rootContainer.className = suit();

  const feedEntries = new Map<string, FeedEntry>();
  let pendingRemovals: IndexWidget[] = [];
  let removalTimer: ReturnType<typeof setTimeout> | null = null;

  let parentRef: IndexWidget;
  let renderOptionsRef: RenderOptions;

  const makeWidget = connectFeeds(
    ({ feedIDs }, isFirstRender) => {
      if (isFirstRender) {
        userContainer.appendChild(rootContainer);
        return;
      }

      const activeFeedIDs = new Set(feedIDs);

      // Remove containers for feeds that no longer exist (deferred)
      const toRemove: IndexWidget[] = [];
      feedEntries.forEach((entry, id) => {
        if (!activeFeedIDs.has(id)) {
          toRemove.push(entry.feedContainer);
          rootContainer.removeChild(entry.domElement);
          feedEntries.delete(id);
        }
      });
      if (toRemove.length > 0) {
        pendingRemovals.push(...toRemove);

        if (removalTimer !== null) {
          clearTimeout(removalTimer);
        }

        removalTimer = setTimeout(() => {
          const widgetsToRemove = pendingRemovals;
          pendingRemovals = [];
          removalTimer = null;
          parentRef.removeWidgets(widgetsToRemove);
        }, 0);
      }

      // Create containers for new feeds
      feedIDs.forEach((feedID) => {
        if (!feedEntries.has(feedID)) {
          const domElement = document.createElement('div');
          domElement.className = suit({ descendantName: 'feed' });
          const feedWidgets = widgets(domElement, feedID);

          const feedContainer = createFeedContainer(
            feedID,
            parentRef,
            renderOptionsRef.instantSearchInstance
          );

          feedEntries.set(feedID, { feedContainer, domElement });
          rootContainer.appendChild(domElement);

          parentRef.addWidgets([feedContainer]);
          if (feedWidgets && feedWidgets.length > 0) {
            feedContainer.addWidgets(feedWidgets);
          }
          feedContainer.render(renderOptionsRef);
        }
      });

      // Reorder DOM nodes to match feedIDs order
      feedIDs.forEach((feedID) => {
        const entry = feedEntries.get(feedID);
        if (entry) {
          rootContainer.appendChild(entry.domElement);
        }
      });
    },
    () => {
      userContainer.removeChild(rootContainer);
    }
  );

  const widget = makeWidget({
    ...connectorParams,
    transformFeeds,
  });

  return {
    ...widget,
    init(initOptions) {
      parentRef = initOptions.parent;
      widget.init!(initOptions);
    },
    render(renderOptions) {
      parentRef = renderOptions.parent;
      renderOptionsRef = renderOptions;
      widget.render!(renderOptions);
    },
    dispose(disposeOptions) {
      if (removalTimer !== null) {
        clearTimeout(removalTimer);
        removalTimer = null;
      }
      const activeContainers = Array.from(feedEntries.values()).map(
        (entry) => entry.feedContainer
      );
      const toRemove = Array.from(
        new Set([...activeContainers, ...pendingRemovals])
      );
      pendingRemovals = [];
      feedEntries.clear();
      if (toRemove.length > 0) {
        disposeOptions.parent.removeWidgets(toRemove);
      }
      widget.dispose!(disposeOptions);
    },
    $$widgetType: 'ais.feeds' as const,
  };
};

export default feeds;
