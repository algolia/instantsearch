import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server';
import { walkIndex } from 'instantsearch.js/es/lib/utils';
import React from 'react';

import { InstantSearchServerContext, InstantSearchSSRProvider } from '..';

import type {
  InstantSearchServerContextApi,
  InstantSearchServerState,
} from '..';
import type { InstantSearch, UiState } from 'instantsearch.js';
import type { ReactNode } from 'react';

type SearchRef = { current: InstantSearch | undefined };

export type RenderToString = (element: JSX.Element) => unknown;

export type GetServerStateOptions = {
  renderToString: RenderToString;
};

/**
 * Returns the InstantSearch server state from a component.
 */
export function getServerState(
  children: ReactNode,
  { renderToString }: GetServerStateOptions
): Promise<InstantSearchServerState> {
  const searchRef: SearchRef = {
    current: undefined,
  };

  const createNotifyServer = () => {
    let hasBeenNotified = false;
    const notifyServer: InstantSearchServerContextApi<
      UiState,
      UiState
    >['notifyServer'] = ({ search }) => {
      if (hasBeenNotified) {
        throw new Error(
          'getServerState should be called with a single InstantSearchSSRProvider and a single InstantSearch component.'
        );
      }

      hasBeenNotified = true;
      searchRef.current = search;
    };

    return notifyServer;
  };

  return execute({
    children,
    renderToString,
    searchRef,
    notifyServer: createNotifyServer(),
  }).then((serverState) => {
    let shouldRefetch = false;

    // <DynamicWidgets> requires another query to retrieve the dynamic widgets
    // to render.
    walkIndex(searchRef.current!.mainIndex, (index) => {
      shouldRefetch =
        shouldRefetch ||
        index
          .getWidgets()
          .some((widget) => widget.$$type === 'ais.dynamicWidgets');
    });

    if (shouldRefetch) {
      return execute({
        children: (
          <InstantSearchSSRProvider {...serverState}>
            {children}
          </InstantSearchSSRProvider>
        ),
        renderToString,
        searchRef,
        notifyServer: createNotifyServer(),
      });
    }

    return serverState;
  });
}

type ExecuteArgs = {
  children: ReactNode;
  renderToString: RenderToString;
  notifyServer: InstantSearchServerContextApi<UiState, UiState>['notifyServer'];
  searchRef: SearchRef;
};

function execute({
  children,
  renderToString,
  notifyServer,
  searchRef,
}: ExecuteArgs) {
  return Promise.resolve()
    .then(() => {
      renderToString(
        <InstantSearchServerContext.Provider value={{ notifyServer }}>
          {children}
        </InstantSearchServerContext.Provider>
      );
    })
    .then(
      () =>
        // We wait for the component to mount so that `notifyServer()` is called.
        new Promise((resolve) => setTimeout(resolve, 0))
    )
    .then(() => {
      // If `notifyServer()` is not called by then, it means that <InstantSearch>
      // wasn't within the `children`.
      // We decide to go with a strict behavior in that case; throwing. If users have
      // some routes that don't mount the <InstantSearch> component, they would need
      // to try/catch the `getServerState()` call.
      // If this behavior turns out to be too strict for many users, we can decide
      // to warn instead of throwing.
      if (!searchRef.current) {
        throw new Error(
          "Unable to retrieve InstantSearch's server state in `getServerState()`. Did you mount the <InstantSearch> component?"
        );
      }

      return waitForResults(searchRef.current);
    })
    .then((requestParams) => {
      return {
        initialResults: getInitialResults(
          searchRef.current!.mainIndex,
          requestParams
        ),
      };
    });
}
