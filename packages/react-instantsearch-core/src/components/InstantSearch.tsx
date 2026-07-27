import React, { useEffect } from 'react';

import { ChatMessageSnapshotContext } from '../lib/ChatMessageSnapshotContext';
import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import {
  ChatMessageSnapshotRetainer,
  useInheritedChatMessagesRevision,
  useOwnedChatMessagesRevision,
} from '../lib/useChatMessagesRevision';
import { useInstantSearchApi } from '../lib/useInstantSearchApi';

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

export function InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({ children, ...props }: InstantSearchProps<TUiState, TRouteState>) {
  const search = useInstantSearchApi<TUiState, TRouteState>(props);
  // An `InstantSearchSSRProvider` renders before any `<Suspense>` boundary
  // below it, so when one is present its capture is the one that matches the
  // server markup and this root inherits it.
  //
  // Capturing here is not only the client-only case. `react-instantsearch-nextjs`
  // supplies `InstantSearchSSRContext` directly and never renders that provider,
  // so every App Router hydration takes this path against real server markup.
  // A boundary above this root is unprotected there, which the provider path
  // does cover.
  const inheritedChatMessageSnapshot = useInheritedChatMessagesRevision();
  const ownsChatMessageSnapshot = inheritedChatMessageSnapshot === undefined;
  const ownedChatMessageSnapshot = useOwnedChatMessagesRevision(
    ownsChatMessageSnapshot
  );
  const chatMessageSnapshot = ownsChatMessageSnapshot
    ? ownedChatMessageSnapshot
    : inheritedChatMessageSnapshot;

  if (!search.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider
      value={search as unknown as InstantSearchType<UiState, UiState>}
    >
      <IndexContext.Provider value={search.mainIndex}>
        <ChatMessageSnapshotContext.Provider value={chatMessageSnapshot}>
          {ownsChatMessageSnapshot && (
            <ChatMessageSnapshotRetainer snapshot={chatMessageSnapshot} />
          )}
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
