import { isIndexWidget } from 'instantsearch.js/es/lib/utils/index';
import React from 'react';
import {
  InstantSearchServerContext,
  InstantSearchSSRProvider,
} from 'react-instantsearch-hooks';

import type { InitialResults, InstantSearch, UiState } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';
import type { ReactNode } from 'react';
import type {
  InstantSearchServerContextApi,
  InstantSearchServerState,
} from 'react-instantsearch-hooks';

type SearchRef = { current: InstantSearch | undefined };

export type RenderToString = (element: JSX.Element) => unknown;

export type GetServerStateOptions = {
  renderToString?: RenderToString;
};

/**
 * Returns the InstantSearch server state from a component.
 */
export function getServerState(
  children: ReactNode,
  options: GetServerStateOptions = {}
): Promise<InstantSearchServerState> {
  const searchRef: SearchRef = {
    current: undefined,
  };

  const notifyServer: InstantSearchServerContextApi<
    UiState,
    UiState
  >['notifyServer'] = ({ search }) => {
    searchRef.current = search;
  };

  return importRenderToString(options.renderToString)
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
    helper.on('error', (error) => reject(error));
    search.on('error', (error) => reject(error));
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

function importRenderToString(
  renderToString?: RenderToString
): Promise<RenderToString> {
  if (renderToString) {
    return Promise.resolve(renderToString);
  }
  // eslint-disable-next-line no-console
  console.warn(
    '[InstantSearch] `renderToString` should be passed to getServerState(<App/>, { renderToString })'
  );

  // React pre-18 doesn't use `exports` in package.json, requiring a fully resolved path
  // Thus, only one of these imports is correct
  const modules = ['react-dom/server.js', 'react-dom/server'];

  // import is an expression to make sure https://github.com/webpack/webpack/issues/13865 does not kick in
  return Promise.all(modules.map((mod) => import(mod).catch(() => {}))).then(
    (imports: unknown[]) => {
      const ReactDOMServer = imports.find(
        (mod): mod is { renderToString: RenderToString } => mod !== undefined
      );

      if (!ReactDOMServer) {
        throw new Error(
          'Could not import ReactDOMServer. You can provide it as an argument: getServerState(<Search />, { renderToString }).'
        );
      }

      return ReactDOMServer.renderToString;
    }
  );
}
