import * as chatRuntime from 'instantsearch.js/es/lib/chat/chat';
import React, { useEffect } from 'react';

import { ChatMessageSnapshotContext } from '../lib/ChatMessageSnapshotContext';
import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import { useInstantSearchApi } from '../lib/useInstantSearchApi';
import { useIsHydrated } from '../lib/useIsHydrated';
import { useIsomorphicLayoutEffect } from '../lib/useIsomorphicLayoutEffect';

import type {
  InternalInstantSearch,
  UseInstantSearchApiProps,
} from '../lib/useInstantSearchApi';
import type {
  InstantSearch as InstantSearchType,
  UiState,
} from 'instantsearch.js';

export type InstantSearchProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = UseInstantSearchApiProps<TUiState, TRouteState> & {
  children?: React.ReactNode;
};

// Destructured rather than kept as a namespace: holding the namespace object in
// a single binding defeats tree shaking and retains the whole Chat runtime for
// consumers that never render Chat. Guarded by `test/module/tree-shaking.mjs`.
const {
  getChatMessagesRevision,
  releaseChatMessagesRevision,
  retainChatMessagesRevision,
  trackChatMessagesRevision,
} = chatRuntime as unknown as {
  getChatMessagesRevision: () => unknown;
  trackChatMessagesRevision: (revision: unknown) => void;
  retainChatMessagesRevision: (revision: unknown) => void;
  releaseChatMessagesRevision: (revision: unknown) => void;
};

export function InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({ children, ...props }: InstantSearchProps<TUiState, TRouteState>) {
  const search = useInstantSearchApi<TUiState, TRouteState>(props);
  const isHydrated = useIsHydrated();
  const chatMessageSnapshotRef = React.useRef<unknown | undefined>(undefined);
  if (chatMessageSnapshotRef.current === undefined) {
    chatMessageSnapshotRef.current = getChatMessagesRevision();
  }
  const chatMessageSnapshot = chatMessageSnapshotRef.current;
  if (!isHydrated) {
    trackChatMessagesRevision(chatMessageSnapshot);
  }
  const retainChatMessageSnapshotRef = React.useRef<boolean | undefined>(
    undefined
  );
  if (retainChatMessageSnapshotRef.current === undefined) {
    retainChatMessageSnapshotRef.current =
      typeof window !== 'undefined' && !isHydrated;
  }
  const retainChatMessageSnapshot = retainChatMessageSnapshotRef.current;

  if (!search.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider
      value={search as unknown as InstantSearchType<UiState, UiState>}
    >
      <IndexContext.Provider value={search.mainIndex}>
        <ChatMessageSnapshotContext.Provider value={chatMessageSnapshot}>
          <ChatMessageSnapshotRetainer
            snapshot={chatMessageSnapshot}
            retain={retainChatMessageSnapshot}
          />
          {children}
          <ResetScheduleSearch
            search={
              search as unknown as InternalInstantSearch<UiState, UiState>
            }
          />
        </ChatMessageSnapshotContext.Provider>
      </IndexContext.Provider>
    </InstantSearchContext.Provider>
  );
}

function ChatMessageSnapshotRetainer({
  snapshot,
  retain,
}: {
  snapshot: unknown;
  retain: boolean;
}) {
  useIsomorphicLayoutEffect(() => {
    if (!retain) {
      return undefined;
    }

    retainChatMessagesRevision(snapshot);

    return () => {
      releaseChatMessagesRevision(snapshot);
    };
  }, [retain, snapshot]);

  return null;
}

function ResetScheduleSearch({
  search,
}: {
  search: InternalInstantSearch<UiState, UiState>;
}) {
  useEffect(() => {
    if (search._resetScheduleSearch) {
      search._resetScheduleSearch();
    }
  }, [search]);

  return null;
}
