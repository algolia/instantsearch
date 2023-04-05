import instantsearch from 'instantsearch.js/es';
import { createInstantSearchComponent } from '../util/createInstantSearchComponent';
import { warn } from '../util/warn';
import { renderCompat, getDefaultSlot } from '../util/vue-compat';

const oldApiWarning = `Vue InstantSearch: You used the prop api-key or app-id.
These have been replaced by search-client.

See more info here: https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-search-client`;

export default createInstantSearchComponent({
  name: 'AisInstantSearch',
  props: {
    searchClient: {
      type: Object,
      required: true,
    },
    insightsClient: {
      type: Function,
      default: undefined,
    },
    indexName: {
      type: String,
      required: true,
    },
    routing: {
      default: undefined,
      validator(value) {
        if (
          typeof value === 'boolean' ||
          (!value.router && !value.stateMapping)
        ) {
          warn(
            'The `routing` option expects an object with `router` and/or `stateMapping`.\n\nSee https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-routing'
          );
          return false;
        }
        return true;
      },
    },
    insights: {
      default: undefined,
      validator(value) {
        return typeof value === 'boolean' || typeof value === 'object';
      },
    },
    stalledSearchDelay: {
      type: Number,
      default: undefined,
    },
    searchFunction: {
      type: Function,
      default: undefined,
    },
    onStateChange: {
      type: Function,
      default: undefined,
    },
    initialUiState: {
      type: Object,
      default: undefined,
    },
    apiKey: {
      type: String,
      default: undefined,
      validator(value) {
        if (value) {
          warn(oldApiWarning);
        }
        return false;
      },
    },
    appId: {
      type: String,
      default: undefined,
      validator(value) {
        if (value) {
          warn(oldApiWarning);
        }
        return false;
      },
    },
    middlewares: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      instantSearchInstance: instantsearch({
        searchClient: this.searchClient,
        insightsClient: this.insightsClient,
        insights: this.insights,
        indexName: this.indexName,
        routing: this.routing,
        stalledSearchDelay: this.stalledSearchDelay,
        searchFunction: this.searchFunction,
        onStateChange: this.onStateChange,
        initialUiState: this.initialUiState,
      }),
    };
  },
  render: renderCompat(function (h) {
    return h(
      'div',
      {
        class: {
          [this.suit()]: true,
          [this.suit('', 'ssr')]: false,
        },
      },
      getDefaultSlot(this)
    );
  }),
});
