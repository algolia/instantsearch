import React from 'react';

import { InstantSearchServerContext } from '../components/InstantSearchServerContext';
import { InstantSearchSSRProvider } from '../components/InstantSearchSSRProvider';
import {
  createServerSearchExecution,
  resetServerSearchWidgetIds,
} from '../lib/serverSearchExecution';

import type { InstantSearchServerContextApi } from '../components/InstantSearchServerContext';
import type { InstantSearchServerState } from '../components/InstantSearchSSRProvider';
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

  resetServerSearchWidgetIds();

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
    const execution = createServerSearchExecution(searchRef.current!);
    const shouldRefetch = execution.hasTwoPassWidgets();

    if (shouldRefetch) {
      resetServerSearchWidgetIds();

      return execute({
        children: (
          <InstantSearchSSRProvider {...serverState}>
            {children}
          </InstantSearchSSRProvider>
        ),
        renderToString,
        searchRef,
        notifyServer: createNotifyServer(),
        skipRecommend: true,
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
  skipRecommend?: boolean;
};

function execute({
  children,
  renderToString,
  notifyServer,
  searchRef,
  skipRecommend,
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

      const execution = createServerSearchExecution(searchRef.current);
      const requestParamsList = execution.prepare({ skipRecommend });

      execution.trigger({ skipRecommend });

      return requestParamsList.then((paramsList) => ({
        execution,
        paramsList,
      }));
    })
    .then(({ execution, paramsList }) => {
      return {
        initialResults: execution.getInitialResults(paramsList),
      };
    });
}
