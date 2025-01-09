import { INSTANTSEARCH_FUTURE_DEFAULTS } from 'instantsearch-core';

import { version } from '../../package.json'; // rollup does pick only what needed from json
import { createSuitMixin } from '../mixins/suit';

import { isVue3, version as vueVersion } from './vue-compat';
import { warn } from './warn';

export const createInstantSearchComponent = (component) => ({
  mixins: [createSuitMixin({ name: 'InstantSearch' })],
  provide() {
    return {
      $_ais_instantSearchInstance: this.instantSearchInstance,
    };
  },
  watch: {
    searchClient(searchClient) {
      warn(
        false,
        'The `search-client` prop of `<ais-instant-search>` changed between renders, which may cause more search requests than necessary. If this is an unwanted behavior, please provide a stable reference: https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-search-client'
      );

      this.instantSearchInstance.client = searchClient;
      if (this.instantSearchInstance.helper) {
        this.instantSearchInstance.helper.setClient(searchClient).search();
      }
    },
    indexName(indexName) {
      if (
        this.instantSearchInstance.mainIndex &&
        this.instantSearchInstance.mainIndex.getHelper()
      ) {
        this.instantSearchInstance.mainIndex
          .getHelper()
          .setIndex(indexName || '')
          .search();
      }
    },
    stalledSearchDelay(stalledSearchDelay) {
      // private InstantSearch.js API:
      this.instantSearchInstance._stalledSearchDelay = stalledSearchDelay;
    },
    routing() {
      throw new Error(
        'routing configuration can not be changed dynamically at this point.' +
          '\n\n' +
          'Please open a new issue: https://github.com/algolia/instantsearch/discussions/new?category=ideas&labels=triage%2cLibrary%3A+Vue+InstantSearch&title=Feature%20request%3A%20dynamic%20props'
      );
    },
    onStateChange() {
      throw new Error(
        'onStateChange configuration can not be changed dynamically at this point.' +
          '\n\n' +
          'Please open a new issue: https://github.com/algolia/instantsearch/discussions/new?category=ideas&labels=triage%2cLibrary%3A+Vue+InstantSearch&title=Feature%20request%3A%20dynamic%20props'
      );
    },
    middlewares: {
      immediate: true,
      handler(next, prev) {
        (prev || [])
          .filter((middleware) => (next || []).indexOf(middleware) === -1)
          .forEach((middlewareToRemove) => {
            this.instantSearchInstance.unuse(middlewareToRemove);
          });

        (next || [])
          .filter((middleware) => (prev || []).indexOf(middleware) === -1)
          .forEach((middlewareToAdd) => {
            this.instantSearchInstance.use(middlewareToAdd);
          });
      },
    },
    future(future) {
      this.instantSearchInstance.future = Object.assign(
        INSTANTSEARCH_FUTURE_DEFAULTS,
        future
      );
    },
  },
  created() {
    const searchClient = this.instantSearchInstance.client;
    if (typeof searchClient.addAlgoliaAgent === 'function') {
      searchClient.addAlgoliaAgent(`Vue (${vueVersion})`);
      searchClient.addAlgoliaAgent(`Vue InstantSearch (${version})`);
    }
  },
  mounted() {
    // from the documentation: https://vuejs.org/v2/api/#mounted
    // "Note that mounted does not guarantee that all child components have also been mounted. If you want to
    // wait until the entire view has been rendered, you can use vm.$nextTick inside of mounted"
    this.$nextTick(() => {
      if (!this.instantSearchInstance.started) {
        this.instantSearchInstance.start();
      }
    });
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    if (this.instantSearchInstance.started) {
      this.instantSearchInstance.dispose();
    }

    // a hydrated instance will no longer be hydrated once disposed, and starts from scratch
    this.instantSearchInstance.__initialSearchResults = undefined;
  },
  ...component,
});
