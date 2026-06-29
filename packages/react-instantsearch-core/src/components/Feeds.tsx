import { createFeedContainer } from 'instantsearch-core';
import React, { useEffect, useRef } from 'react';

import { useFeeds } from '../connectors/useFeeds';
import { IndexContext } from '../lib/IndexContext';
import { useIndexContext } from '../lib/useIndexContext';
import { useInstantSearchContext } from '../lib/useInstantSearchContext';

import type { FeedsConnectorParams } from 'instantsearch-core';
import type { IndexWidget } from 'instantsearch-core';
import type { ReactNode } from 'react';

export type FeedsProps = FeedsConnectorParams & {
  renderFeed: ({ feedID }: { feedID: string }) => ReactNode;
};

export function Feeds({ renderFeed, ...props }: FeedsProps) {
  const { feedIDs } = useFeeds(props, {
    $$widgetType: 'ais.feeds',
  });

  const parentIndex = useIndexContext();
  const instantSearchInstance = useInstantSearchContext();

  const feedContainersRef = useRef(new Map<string, IndexWidget>());
  const removalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRemovalsRef = useRef(new Map<string, IndexWidget>());

  // Create and register new FeedContainers synchronously so SSR and the first
  // client render can provide the matching feed index context to children.
  const toAdd: IndexWidget[] = [];
  feedIDs.forEach((feedID) => {
    if (!feedContainersRef.current.has(feedID)) {
      const pendingContainer = pendingRemovalsRef.current.get(feedID);
      if (pendingContainer) {
        pendingRemovalsRef.current.delete(feedID);
        feedContainersRef.current.set(feedID, pendingContainer);
        return;
      }

      const container = createFeedContainer(
        feedID,
        parentIndex,
        instantSearchInstance
      );
      feedContainersRef.current.set(feedID, container);
      toAdd.push(container);
    }
  });
  if (toAdd.length > 0) {
    parentIndex.addWidgets(toAdd);
  }

  // Remove containers that are no longer in feedIDs (deferred to match useWidget pattern).
  useEffect(() => {
    const containers = feedContainersRef.current;

    const activeSet = new Set(feedIDs);
    const toRemove: Array<[string, IndexWidget]> = [];
    containers.forEach((container, id) => {
      if (!activeSet.has(id)) {
        toRemove.push([id, container]);
        containers.delete(id);
      }
    });

    if (toRemove.length > 0) {
      toRemove.forEach(([id, container]) => {
        pendingRemovalsRef.current.set(id, container);
      });

      if (removalTimerRef.current !== null) {
        clearTimeout(removalTimerRef.current);
      }

      removalTimerRef.current = setTimeout(() => {
        const widgetsToRemove = Array.from(pendingRemovalsRef.current.values());
        pendingRemovalsRef.current.clear();
        removalTimerRef.current = null;

        if (widgetsToRemove.length > 0) {
          parentIndex.removeWidgets(widgetsToRemove);
        }
      }, 0);
    }
  }, [feedIDs, parentIndex]);

  useEffect(() => {
    return () => {
      if (removalTimerRef.current !== null) {
        clearTimeout(removalTimerRef.current);
        removalTimerRef.current = null;
      }

      const containers = feedContainersRef.current;
      const toRemove = Array.from(
        new Set([
          ...containers.values(),
          ...pendingRemovalsRef.current.values(),
        ])
      );
      pendingRemovalsRef.current.clear();
      containers.clear();
      if (toRemove.length > 0) {
        parentIndex.removeWidgets(toRemove);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {feedIDs.map((feedID) => {
        const container = feedContainersRef.current.get(feedID);
        if (!container) {
          return null;
        }
        return (
          <IndexContext.Provider key={feedID} value={container}>
            {renderFeed({ feedID })}
          </IndexContext.Provider>
        );
      })}
    </>
  );
}
