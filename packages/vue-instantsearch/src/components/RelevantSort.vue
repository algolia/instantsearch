<template>
  <div v-if="state && state.isVirtualReplica" :class="suit()">
    <slot :is-relevant-sorted="state.isRelevantSorted" :refine="state.refine">
      <div :class="suit('text')">
        <slot name="text" :is-relevant-sorted="state.isRelevantSorted" />
      </div>
      <button type="button" :class="suit('button')" @click="refine()">
        <slot name="button" :is-relevant-sorted="state.isRelevantSorted">
          {{
            state.isRelevantSorted ? 'See all results' : 'See relevant results'
          }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script>
import { connectRelevantSort } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisRelevantSort',
  mixins: [
    createSuitMixin({ name: 'RelevantSort' }),
    createWidgetMixin(
      {
        connector: connectRelevantSort,
      },
      {
        $$widgetType: 'ais.relevantSort',
      }
    ),
  ],
  methods: {
    refine() {
      if (this.state.isRelevantSorted) {
        this.state.refine(0);
      } else {
        this.state.refine(undefined);
      }
    },
  },
};
</script>
