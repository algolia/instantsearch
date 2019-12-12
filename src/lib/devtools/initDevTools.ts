import { Client as AlgoliaSearchClient } from 'algoliasearch';
import { InstantSearch } from '../../types';
import { Middleware } from '../../middleware';

export type DevToolsWindow = Window &
  typeof globalThis & {
    __INSTANTSEARCH_DEVTOOLS__: {
      version: string;
      getMiddleware: () => Middleware;
    };
  };

export function initDevTools(instantSearchInstance: InstantSearch) {
  if (typeof window !== 'undefined') {
    const instantSearchDevTools = (window as DevToolsWindow)
      .__INSTANTSEARCH_DEVTOOLS__;

    if (instantSearchDevTools) {
      instantSearchInstance._isDevToolsAttached = true;

      instantSearchInstance.EXPERIMENTAL_use(
        instantSearchDevTools.getMiddleware()
      );

      if (
        typeof (instantSearchInstance.client as AlgoliaSearchClient)
          .addAlgoliaAgent === 'function'
      ) {
        (instantSearchInstance.client as AlgoliaSearchClient).addAlgoliaAgent(
          `instantsearch-devtools (${instantSearchDevTools.version})`
        );
      }
    }
  }
}
