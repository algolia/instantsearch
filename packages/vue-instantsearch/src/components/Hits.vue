<template>
  <div :class="suit()" v-if="state">
    <slot :items="items">
      <ol :class="suit('list')">
        <li
          v-for="(item, itemIndex) in items"
          :key="item.objectID"
          :class="suit('item')"
        >
          <slot name="item" :item="item" :index="itemIndex">
            objectID: {{item.objectID}}, index: {{itemIndex}}
          </slot>
        </li>
      </ol>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectHits } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      widgetName: 'Hits',
    };
  },
  beforeCreate() {
    this.connector = connectHits;
  },
  computed: {
    // Fixes InstantSearch.js connectors API: every list of things must be called `items`
    items() {
      return this.state.hits;
    },
  },
};</script>
