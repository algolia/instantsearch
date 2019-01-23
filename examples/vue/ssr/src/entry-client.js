import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client';

import { createApp } from './main';

createApp({
  async beforeApp({ router, instantsearch }) {
    if (window.__ALGOLIA_STATE__) {
      instantsearch.hydrate(window.__ALGOLIA_STATE__);
      delete window.__ALGOLIA_STATE__;
    }
    await loadAsyncComponents({ router });
  },

  afterApp({ app }) {
    app.$mount('#app');
  },
});
