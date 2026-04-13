import React, { useEffect, useRef } from 'react';

import { createFeedContainer } from 'instantsearch.js/es/connectors/feeds/FeedContainer';

import { useFeeds } from '../connectors/useFeeds';
import { IndexContext } from '../lib/IndexContext';
import { useIndexContext } from '../lib/useIndexContext';
import { useInstantSearchContext } from '../lib/useInstantSearchContext';

import type { FeedsConnectorParams } from 'instantsearch.js/es/connectors/feeds/connectFeeds';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';
import type { ReactNode } from 'react';

export type FeedsProps = FeedsConnectorParams & {
  children: (feedID: string) => ReactNode;
};

export function Feeds({ children, ...props }: FeedsProps) {
  const { feedIDs } = useFeeds(props, {
    $$widgetType: 'ais.feeds',
  });

  const parentIndex = useIndexContext();
  const instantSearchInstance = useInstantSearchContext();

  const feedContainersRef = useRef(new Map<string, IndexWidget>());
  const removalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRemovalsRef = useRef<IndexWidget[]>([]);

  // Create and register new FeedContainers synchronously so SSR and the first
  // client render can provide the matching feed index context to children.
  const toAdd: IndexWidget[] = [];
  feedIDs.forEach((feedID) => {
    if (!feedContainersRef.current.has(feedID)) {
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
    const toRemove: IndexWidget[] = [];
    containers.forEach((container, id) => {
      if (!activeSet.has(id)) {
        toRemove.push(container);
        containers.delete(id);
      }
    });

    if (toRemove.length > 0) {
      pendingRemovalsRef.current.push(...toRemove);

      if (removalTimerRef.current !== null) {
        clearTimeout(removalTimerRef.current);
      }

      removalTimerRef.current = setTimeout(() => {
        const widgetsToRemove = pendingRemovalsRef.current;
        pendingRemovalsRef.current = [];
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
        new Set([...containers.values(), ...pendingRemovalsRef.current])
      );
      pendingRemovalsRef.current = [];
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
            {children(feedID)}
          </IndexContext.Provider>
        );
      })}
    </>
  );
}
