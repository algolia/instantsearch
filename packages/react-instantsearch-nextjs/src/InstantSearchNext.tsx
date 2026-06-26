import { safelyRunOnBrowser } from 'instantsearch.js/es/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRContext,
} from 'react-instantsearch-core';

import { InitializePromise } from './InitializePromise';
import { TriggerSearch } from './TriggerSearch';
import { useDynamicRouteWarning } from './useDynamicRouteWarning';
import { useInstantSearchRouting } from './useInstantSearchRouting';
import { useNextHeaders } from './useNextHeaders';

import type { InitialResults, StateMapping, UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type {
  InstantSearchProps,
  InstantSearchSSRContextApi,
  PromiseWithState,
} from 'react-instantsearch-core';

const InstantSearchInitialResults = Symbol.for('InstantSearchInitialResults');
declare global {
  interface Window {
    [InstantSearchInitialResults]?: InitialResults;
  }
}

export type InstantSearchNextInstance =
  InstantSearchSSRContextApi<UiState>['ssrSearchRef'];

export function createInstantSearchNextInstance(): InstantSearchNextInstance {
  return { current: null };
}

export type InstantSearchNextRouting<TUiState, TRouteState> = {
  router?: Partial<BrowserHistoryArgs<TRouteState>>;
  stateMapping?: StateMapping<TUiState, TRouteState>;
};

export type InstantSearchNextProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = Omit<InstantSearchProps<TUiState, TRouteState>, 'routing'> & {
  routing?: InstantSearchNextRouting<TUiState, TRouteState> | boolean;
  instance?: InstantSearchNextInstance;
  ignoreMultipleHooksWarning?: boolean;
};

export function InstantSearchNext<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({
  children,
  routing: passedRouting,
  instance,
  ignoreMultipleHooksWarning = false,
  ...instantSearchProps
}: InstantSearchNextProps<TUiState, TRouteState>) {
  const isMounting = useRef(true);
  const isServer = typeof window === 'undefined';

  useEffect(() => {
    isMounting.current = false;
  }, []);

  const headers = useNextHeaders();

  const nonce = safelyRunOnBrowser(() => undefined, {
    fallback: () => headers?.get('x-nonce') || undefined,
  });

  useDynamicRouteWarning({ isServer, isMounting, instance });

  const routing = useInstantSearchRouting(passedRouting, isMounting);

  return (
    <ServerOrHydrationProvider
      isServer={isServer}
      instance={instance}
      ignoreMultipleHooksWarning={ignoreMultipleHooksWarning}
    >
      <InstantSearch {...instantSearchProps} routing={routing!}>
        {isServer && <InitializePromise nonce={nonce} />}
        {children}
        {isServer && <TriggerSearch nonce={nonce} />}
      </InstantSearch>
    </ServerOrHydrationProvider>
  );
}

function ServerOrHydrationProvider({
  isServer,
  children,
  instance,
  ignoreMultipleHooksWarning,
}: {
  isServer: boolean;
  children: React.ReactNode;
  instance?: InstantSearchNextInstance;
  ignoreMultipleHooksWarning: boolean;
}) {
  const promiseRef = useRef<PromiseWithState<void> | null>(null);
  const countRef = useRef(0);
  // Capture once on first render. Side-effect-free read keeps hydration
  // deterministic across StrictMode double-invocation and React 19 / Next.js
  // metadata streaming re-renders.
  const [initialResults] = useState<InitialResults | undefined>(() =>
    safelyRunOnBrowser(({ window }) => window[InstantSearchInitialResults])
  );
  // After commit, clear the global so a later <InstantSearchNext> mount —
  // typically the destination of an App Router <Link> click — does not
  // recycle this mount's serialized state.
  useEffect(() => {
    safelyRunOnBrowser(({ window }) => {
      if (window[InstantSearchInitialResults] !== undefined) {
        window[InstantSearchInitialResults] = undefined;
      }
    });
  }, []);
  // `useInstantSearchApi` reads a truthy `waitForResultsRef` as "SSR results
  // are arriving" and skips the initial search. On client mounts without
  // results (typical for SPA navigation) we must let it fall through.
  const rscWaitRef = !isServer && !initialResults ? null : promiseRef;

  return (
    <InstantSearchRSCContext.Provider
      value={{
        waitForResultsRef: rscWaitRef,
        countRef,
        ignoreMultipleHooksWarning,
      }}
    >
      <InstantSearchSSRContext.Provider
        value={{
          initialResults,
          ssrSearchRef: isServer ? undefined : instance,
        }}
      >
        {children}
      </InstantSearchSSRContext.Provider>
    </InstantSearchRSCContext.Provider>
  );
}
