import { instantsearch } from 'instantsearch-core';

import { createInstantSearchComponent } from '../util/createInstantSearchComponent';
import { renderCompat, getDefaultSlot } from '../util/vue-compat';
import { warn } from '../util/warn';

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
    indexName: {
      type: String,
      required: false,
    },
    compositionID: {
      type: String,
      required: false,
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
        return (
          typeof value === 'undefined' ||
          typeof value === 'boolean' ||
          typeof value === 'object'
        );
      },
    },
    stalledSearchDelay: {
      type: Number,
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
    future: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      instantSearchInstance: instantsearch({
        searchClient: this.searchClient,
        insights: this.insights,
        indexName: this.indexName,
        compositionID: this.compositionID,
        routing: this.routing,
        stalledSearchDelay: this.stalledSearchDelay,
        onStateChange: this.onStateChange,
        initialUiState: this.initialUiState,
        future: this.future,
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
