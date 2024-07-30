/* eslint-disable no-nested-ternary */
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import qs from 'qs';
import Vue from 'vue';
import { createServerRootMixin } from 'vue-instantsearch';
import _renderToString from 'vue-server-renderer/basic';

import App from './App.vue';
import { createRouter } from './router';

function renderToString(app) {
  return new Promise((resolve, reject) => {
    _renderToString(app, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

Vue.config.productionTip = false;

export async function createApp({
  beforeApp = () => {},
  afterApp = () => {},
  context,
} = {}) {
  const router = createRouter();

  await beforeApp({
    router,
  });

  const app = new Vue({
    mixins: [
      createServerRootMixin({
        searchClient,
        indexName: 'instant_search',
        insights: true,
        routing: {
          router: {
            read() {
              const url = context
                ? context.url
                : typeof window.location === 'object'
                ? window.location.href
                : '';
              const search = url.slice(url.indexOf('?'));

              return qs.parse(search, {
                ignoreQueryPrefix: true,
              });
            },
            write(routeState) {
              const query = qs.stringify(routeState, {
                addQueryPrefix: true,
              });

              if (typeof history === 'object') {
                history.pushState(routeState, null, query);
              }
            },
            createURL(routeState) {
              const query = qs.stringify(routeState, {
                addQueryPrefix: true,
              });

              return query;
            },
            onUpdate(callback) {
              if (typeof window !== 'object') {
                return;
              }
              this._onPopState = (event) => {
                if (this.writeTimer) {
                  window.clearTimeout(this.writeTimer);
                  this.writeTimer = undefined;
                }

                const routeState = event.state;

                // At initial load, the state is read from the URL without update.
                // Therefore the state object is not available.
                // In this case, we fallback and read the URL.
                if (!routeState) {
                  callback(this.read());
                } else {
                  callback(routeState);
                }
              };

              window.addEventListener('popstate', this._onPopState);
            },
            dispose() {
              if (this._onPopState && typeof window === 'object') {
                window.removeEventListener('popstate', this._onPopState);
              }

              // we purposely don't write on dispose, to prevent double entries on navigation
            },
          },
        },
        // other options, like
        // stalledSearchDelay: 50
      }),
    ],
    serverPrefetch() {
      return this.instantsearch.findResultsState({
        component: this,
        renderToString,
      });
    },
    beforeMount() {
      if (typeof window === 'object' && window.__ALGOLIA_STATE__) {
        this.instantsearch.hydrate(window.__ALGOLIA_STATE__);
        delete window.__ALGOLIA_STATE__;
      }
    },
    router,
    render: (h) => h(App),
  });

  const result = {
    app,
    router,
  };

  await afterApp(result);

  return result;
}
