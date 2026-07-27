import * as chatMessagesRevision from 'instantsearch.js/es/lib/chat/messagesRevision';
import React from 'react';

import { ChatMessageSnapshotContext } from './ChatMessageSnapshotContext';
import { useIsHydrated } from './useIsHydrated';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

// The helpers are `@internal`, so their declarations are stripped from the
// built types and the import needs a namespace and a cast. Destructured rather
// than kept as a namespace: holding the namespace object in a single binding
// defeats tree shaking. Guarded by `test/module/tree-shaking.mjs`.
const {
  getChatMessagesRevision,
  releaseChatMessagesRevision,
  retainChatMessagesRevision,
  trackChatMessagesRevision,
} = chatMessagesRevision as unknown as {
  getChatMessagesRevision: () => unknown;
  trackChatMessagesRevision: (revision: unknown) => void;
  retainChatMessagesRevision: (revision: unknown) => void;
  releaseChatMessagesRevision: (revision: unknown) => void;
};

/**
 * Captures the message baseline a hydrating Chat consumer renders against.
 *
 * The capture happens on the first render of whichever component owns it, so
 * where that component sits decides what the baseline contains. An ancestor
 * that renders before any `<Suspense>` boundary captures the messages the
 * server serialized; a component behind such a boundary renders for the first
 * time only once it resolves, by which point the client may have moved on, and
 * the capture would hand those newer messages back as the server baseline.
 *
 * `InstantSearchSSRProvider` therefore captures for the whole tree and passes
 * the result down. `InstantSearch` captures only when no provider did. That is
 * the client-only case, and also the App Router, where
 * `react-instantsearch-nextjs` supplies `InstantSearchSSRContext` itself and
 * never renders the provider.
 */
export function useOwnedChatMessagesRevision(enabled: boolean): unknown {
  const snapshotRef = React.useRef<unknown | undefined>(undefined);
  // An ancestor that already captured is the one whose revision the whole tree
  // uses, so capturing again here would only allocate a revision this component
  // then discards.
  if (enabled && snapshotRef.current === undefined) {
    snapshotRef.current = getChatMessagesRevision();
  }
  const snapshot = snapshotRef.current;

  if (enabled) {
    // Registered next to the capture rather than in the retainer below. React
    // can yield between two fibers, and a message update landing in that gap
    // would find no registration to record its pre-update snapshot into.
    //
    // This is a weak registration, so it also covers the server pass and any
    // concurrent render React throws away without ever running an effect.
    trackChatMessagesRevision(snapshot);
  }

  return snapshot;
}

/**
 * Reads the baseline an ancestor captured, or `undefined` when nothing did.
 */
export function useInheritedChatMessagesRevision(): unknown {
  return React.useContext(ChatMessageSnapshotContext);
}

/**
 * Decides how long the owner's captured revision stays registered.
 *
 * A root that is hydrating holds it until unmount, because a `<Suspense>`
 * boundary below can hydrate much later and still need the baseline. A root
 * mounted straight into the browser has no server markup to reproduce, so
 * nothing will ever ask it for one; it retires the registration on its first
 * commit instead of leaving that root in a set every message update walks,
 * pinning one obsolete snapshot per chat for as long as it lives.
 *
 * The hydration signal is read here rather than in the owner because it comes
 * from a store whose server and client snapshots differ. Reading one of those
 * is safe only where the value stays local: it must not change what any
 * ancestor of a `<Suspense>` boundary renders or provides, or React abandons
 * the dehydrated subtree and client-renders it. This component consumes the
 * value itself and renders nothing, so it qualifies. Being a sibling is not on
 * its own sufficient, and an ancestor that returns `children` untouched would
 * also qualify.
 *
 * A component rather than a hook because `InstantSearch` returns early before
 * its search instance has started, which rules out a layout effect in its body.
 */
export function ChatMessageSnapshotRetainer({
  snapshot,
}: {
  snapshot: unknown;
}) {
  const isHydrated = useIsHydrated();
  const hydratingRef = React.useRef<boolean | undefined>(undefined);
  if (hydratingRef.current === undefined) {
    hydratingRef.current = !isHydrated;
  }
  const isHydrating = hydratingRef.current;

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!isHydrating) {
      releaseChatMessagesRevision(snapshot);
      return undefined;
    }

    retainChatMessagesRevision(snapshot);

    return () => {
      releaseChatMessagesRevision(snapshot);
    };
  }, [isHydrating, snapshot]);

  return null;
}
