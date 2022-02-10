import { createSuitMixin } from '../mixins/suit';
import { version } from '../../package.json'; // rollup does pick only what needed from json
import { _objectSpread } from './polyfills';
import { isVue3, version as vueVersion } from './vue-compat';

export const createInstantSearchComponent = component =>
  _objectSpread(
    {
      mixins: [createSuitMixin({ name: 'InstantSearch' })],
      provide() {
        return {
          $_ais_instantSearchInstance: this.instantSearchInstance,
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
        middlewares: {
          immediate: true,
          handler(next, prev) {
            (prev || [])
              .filter(middleware => (next || []).indexOf(middleware) === -1)
              .forEach(middlewareToRemove => {
                this.instantSearchInstance.unuse(middlewareToRemove);
              });

            (next || [])
              .filter(middleware => (prev || []).indexOf(middleware) === -1)
              .forEach(middlewareToAdd => {
                this.instantSearchInstance.use(middlewareToAdd);
              });
          },
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
    },
    component
  );
