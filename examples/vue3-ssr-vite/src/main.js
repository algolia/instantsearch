import { createServerRootMixin } from 'vue-instantsearch/dist/vue3/es';
import algoliasearch from 'algoliasearch/lite';
import { createSSRApp, h } from 'vue';
import qs from 'qs';

import App from './App.vue';
import { createRouter } from './router';

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp({ context } = {}) {
  const searchClient = algoliasearch(
    'latency',
    '6be0576ff61c053d5f9a3225e2a90f76'
  );

  let resultsState;

  const router = createRouter();

  const app = createSSRApp({
    mixins: [
      createServerRootMixin({
        searchClient,
        indexName: 'instant_search',
        routing: {
          router: {
            read() {
              let url;
              if (context) {
                url = context.url;
              } else {
                url =
                  typeof window === 'object' &&
                  typeof window.location === 'object'
                    ? window.location.href
                    : '';
              }

              const search = url.slice(url.indexOf('?'));
              return qs.parse(search, {
                ignoreQueryPrefix: true,
              });
            },
            write(routeState) {
              router.push({
                query: routeState,
              });
            },
            createURL(routeState) {
              return router.resolve({ query: routeState }).href;
            },
            onUpdate(callback) {
              this._onPopState = event => {
                const routeState = event.state;
                // at initial load, the state is read from the URL without
                // update. Therefore the state object is not there. In this
                // case we fallback and read the URL.
                if (!routeState) {
                  callback(this.read());
                } else {
                  callback(routeState);
                }
              };
              window.addEventListener('popstate', this._onPopState);
            },
            dispose() {
              window.removeEventListener('popstate', this._onPopState);
              this.write();
            },
          },
          stateMapping: {
            stateToRoute(uiState) {
              return Object.keys(uiState).reduce(
                (state, indexId) => ({
                  ...state,
                  [indexId]: getIndexStateWithoutConfigure(uiState[indexId]),
                }),
                {}
              );
            },
            routeToState(routeState = {}) {
              return Object.keys(routeState).reduce(
                (state, indexId) => ({
                  ...state,
                  [indexId]: getIndexStateWithoutConfigure(routeState[indexId]),
                }),
                {}
              );
            },
          },
        },
      }),
    ],
    async serverPrefetch() {
      resultsState = await this.instantsearch.findResultsState(this);
      return resultsState;
    },
    beforeMount() {
      if (typeof window === 'object' && window.__ALGOLIA_STATE__) {
        this.instantsearch.hydrate(window.__ALGOLIA_STATE__);
        delete window.__ALGOLIA_STATE__;
      }
    },
    render: () => h(App),
  });
  // app.use(InstantSearch)
  app.use(router);
  return { app, router, getResultsState: () => resultsState };
}

function getIndexStateWithoutConfigure(uiState) {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}
