import { safelyRunOnBrowser } from 'instantsearch-core';
import React, { useEffect, useRef } from 'react';
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
import { warn } from './warn';

import type {
  InitialResults,
  StateMapping,
  UiState,
  BrowserHistoryArgs,
} from 'instantsearch-core';
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

  warn(
    false,
    `InstantSearchNext relies on experimental APIs and may break in the future.
This message will only be displayed in development mode.`
  );

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
  const initialResults = safelyRunOnBrowser(
    () => window[InstantSearchInitialResults]
  );

  return (
    <InstantSearchRSCContext.Provider
      value={{
        waitForResultsRef: promiseRef,
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
