import { isIndexWidget } from 'instantsearch.js/es/widgets/index/index';
import React from 'react';
import {
  InstantSearchServerContext,
  InstantSearchSSRProvider,
} from 'react-instantsearch-hooks';

import type { InitialResults, InstantSearch } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';
import type { ReactNode } from 'react';
import type { renderToString as RenderToString } from 'react-dom/server';
import type {
  InstantSearchServerContextApi,
  InstantSearchServerState,
} from 'react-instantsearch-hooks';

type SearchRef = { current: InstantSearch | undefined };

/**
 * Returns the InstantSearch server state from a component.
 */
export function getServerState(
  children: ReactNode
): Promise<InstantSearchServerState> {
  const searchRef: SearchRef = {
    current: undefined,
  };

  const notifyServer: InstantSearchServerContextApi['notifyServer'] = ({
    search,
  }) => {
    searchRef.current = search;
  };

  return importRenderToString()
    .then((renderToString) => {
      return execute({
        children,
        renderToString,
        searchRef,
        notifyServer,
      }).then((serverState) => ({ serverState, renderToString }));
    })
    .then(({ renderToString, serverState }) => {
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
          notifyServer,
        });
      }

      return serverState;
    });
}

type ExecuteArgs = {
  children: ReactNode;
  renderToString: typeof RenderToString;
  notifyServer: InstantSearchServerContextApi['notifyServer'];
  searchRef: SearchRef;
};

function execute({
  children,
  renderToString,
  notifyServer,
  searchRef,
}: ExecuteArgs) {
  renderToString(
    <InstantSearchServerContext.Provider value={{ notifyServer }}>
      {children}
    </InstantSearchServerContext.Provider>
  );

  // We wait for the component to mount so that `notifyServer()` is called.
  return new Promise((resolve) => setTimeout(resolve, 0))
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
    .then(() => {
      const initialResults = getInitialResults(searchRef.current!.mainIndex);

      return {
        initialResults,
      };
    });
}

/**
 * Waits for the results from the search instance to coordinate the next steps
 * in `getServerState()`.
 */
function waitForResults(search: InstantSearch) {
  const helper = search.mainHelper!;

  helper.searchOnlyWithDerivedHelpers();

  return new Promise<void>((resolve, reject) => {
    // All derived helpers resolve in the same tick so we're safe only relying
    // on the first one.
    helper.derivedHelpers[0].on('result', () => {
      resolve();
    });

    // However, we listen to errors that can happen on any derived helper because
    // any error is critical.
    helper.derivedHelpers.forEach((derivedHelper) =>
      derivedHelper.on('error', (error) => {
        reject(error);
      })
    );
  });
}

/**
 * Recurse over all child indices
 */
function walkIndex(
  indexWidget: IndexWidget,
  callback: (widget: IndexWidget) => void
) {
  callback(indexWidget);

  return indexWidget.getWidgets().forEach((widget) => {
    if (!isIndexWidget(widget)) {
      return;
    }

    callback(widget);
    walkIndex(widget, callback);
  });
}

/**
 * Walks the InstantSearch root index to construct the initial results.
 */
function getInitialResults(rootIndex: IndexWidget): InitialResults {
  const initialResults: InitialResults = {};

  walkIndex(rootIndex, (widget) => {
    const searchResults = widget.getResults()!;
    initialResults[widget.getIndexId()] = {
      // We convert the Helper state to a plain object to pass parsable data
      // structures from server to client.
      state: { ...searchResults._state },
      results: searchResults._rawResults,
    };
  });

  return initialResults;
}

function importRenderToString() {
  return Promise.all([
    // React pre-18 doesn't use `exports` in package.json, requiring a fully resolved path
    // Thus, only one of these imports is correct
    // eslint-disable-next-line import/extensions
    import('react-dom/server.js').catch(() => {}),
    import('react-dom/server').catch(() => {}),
  ]).then((imports) => {
    const ReactDOMServer = imports.find(
      (mod): mod is { renderToString: typeof RenderToString } =>
        mod !== undefined
    );

    if (!ReactDOMServer) {
      throw new Error('Could not import ReactDOMServer.');
    }

    return ReactDOMServer.renderToString;
  });
}
