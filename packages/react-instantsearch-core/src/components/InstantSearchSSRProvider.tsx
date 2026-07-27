import React from 'react';

import { ChatMessageSnapshotContext } from '../lib/ChatMessageSnapshotContext';
import { InstantSearchHydrationContext } from '../lib/InstantSearchHydrationContext';
import { InstantSearchSSRContext } from '../lib/InstantSearchSSRContext';
import {
  ChatMessageSnapshotRetainer,
  useInheritedChatMessagesRevision,
  useOwnedChatMessagesRevision,
} from '../lib/useChatMessagesRevision';

import type { InternalInstantSearch } from '../lib/useInstantSearchApi';
import type { InitialResults, UiState } from 'instantsearch.js';
import type { ReactNode } from 'react';

export type InstantSearchServerState = {
  initialResults: InitialResults;
};

export type InstantSearchSSRProviderProps =
  Partial<InstantSearchServerState> & {
    children?: ReactNode;
  };

/**
 * Provider to pass the server state retrieved from `getServerState()` to
 * <InstantSearch>.
 */
export function InstantSearchSSRProvider<
  TUiState extends UiState,
  TRouteState = TUiState
>({ children, ...props }: InstantSearchSSRProviderProps) {
  // This is used in `useInstantSearchApi()` to avoid creating and starting multiple instances of
  // `InstantSearch` on mount.
  const ssrSearchRef = React.useRef<InternalInstantSearch<
    UiState,
    TRouteState
  > | null>(null);

  // This is used to re-map the result index to the requesting widget
  const recommendIdx = React.useRef(0);

  const hasNativeHydrationSnapshot =
    typeof React.useSyncExternalStore === 'function';
  const [isHydrated, setIsHydrated] = React.useState(
    hasNativeHydrationSnapshot
  );
  React.useEffect(() => {
    if (!hasNativeHydrationSnapshot) {
      setIsHydrated(true);
    }
  }, [hasNativeHydrationSnapshot]);

  // Captured here rather than in `<InstantSearch>` because this provider
  // renders before any `<Suspense>` boundary beneath it. A root behind such a
  // boundary first renders only once it resolves, and a capture taken then
  // would already contain client updates the server markup never had.
  //
  // The outermost provider wins. A nested provider can itself sit behind a
  // boundary, so letting it recapture would reintroduce the late capture this
  // is here to prevent.
  const inheritedChatMessageSnapshot = useInheritedChatMessagesRevision();
  const ownsChatMessageSnapshot = inheritedChatMessageSnapshot === undefined;
  const ownedChatMessageSnapshot = useOwnedChatMessagesRevision(
    ownsChatMessageSnapshot
  );
  const withChatMessageSnapshot = (node: ReactNode) =>
    ownsChatMessageSnapshot ? (
      <ChatMessageSnapshotContext.Provider value={ownedChatMessageSnapshot}>
        <ChatMessageSnapshotRetainer snapshot={ownedChatMessageSnapshot} />
        {node}
      </ChatMessageSnapshotContext.Provider>
    ) : (
      node
    );

  // When <DynamicWidgets> is mounted, a second provider is used above the user-land
  // <InstantSearchSSRProvider> in `getServerState()`.
  // To avoid the user's provider overriding the context value with an empty object,
  // we skip this provider.
  if (Object.keys(props).length === 0) {
    // Only the SSR context is skipped. The hydration signal still has to reach
    // consumers, or React 16 and 17 lose their masking and hydrate against a
    // tree the server never rendered.
    return (
      <InstantSearchHydrationContext.Provider value={isHydrated}>
        {withChatMessageSnapshot(children)}
      </InstantSearchHydrationContext.Provider>
    );
  }

  return (
    <InstantSearchHydrationContext.Provider value={isHydrated}>
      <InstantSearchSSRContext.Provider
        value={{ ...props, ssrSearchRef, recommendIdx }}
      >
        {withChatMessageSnapshot(children)}
      </InstantSearchSSRContext.Provider>
    </InstantSearchHydrationContext.Provider>
  );
}
