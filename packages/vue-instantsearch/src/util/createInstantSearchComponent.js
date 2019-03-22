import { createSuitMixin } from '../mixins/suit';
import { version } from '../../package.json'; // rollup does pick only what needed from json
import { _objectSpread } from './polyfills';
import Vue from 'vue';

export const createInstantSearchComponent = component =>
  _objectSpread(
    {
      mixins: [createSuitMixin({ name: 'InstantSearch' })],
      provide() {
        return {
          instantSearchInstance: this.instantSearchInstance,
        };
      },
      watch: {
        searchClient(searchClient) {
          this.instantSearchInstance.helper.setClient(searchClient).search();
        },
        indexName(indexName) {
          this.instantSearchInstance.helper.setIndex(indexName).search();
        },
        stalledSearchDelay(stalledSearchDelay) {
          // private InstantSearch.js API:
          this.instantSearchInstance._stalledSearchDelay = stalledSearchDelay;
        },
        routing() {
          throw new Error(
            'routing configuration can not be changed dynamically at this point.' +
              '\n\n' +
              'Please open a new issue: https://github.com/algolia/vue-instantsearch/issues/new?template=feature.md'
          );
        },
        searchFunction(searchFunction) {
          // private InstantSearch.js API:
          this.instantSearchInstance._searchFunction = searchFunction;
        },
      },
      created() {
        const searchClient = this.instantSearchInstance.client;
        if (typeof searchClient.addAlgoliaAgent === 'function') {
          searchClient.addAlgoliaAgent(`Vue (${Vue.version})`);
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
      beforeDestroy() {
        if (this.instantSearchInstance.started) {
          this.instantSearchInstance.dispose();

          // TODO: remove this once algolia/instantsearch.js#3399 is used
          this.instantSearchInstance.started = false;

          // TODO: remove this once algolia/instantsearch.js#3415 is used
          this.instantSearchInstance.helper = null;
        }

        // a hydrated instance will no longer be hydrated once disposed, and starts from scratch
        this.instantSearchInstance.hydrated = false;
      },
    },
    component
  );
