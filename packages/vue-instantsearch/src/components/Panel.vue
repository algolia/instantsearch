<template>
  <div :class="[suit(''), !canRefine && suit('', 'noRefinement')]">
    <div v-if="$slots.header" :class="suit('header')">
      <slot name="header"></slot>
    </div>
    <div class="ais-Panel-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" :class="suit('footer')">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import suit from '../suit';
import { createPanelProviderMixin } from '../panel';

export default {
  mixins: [createPanelProviderMixin()],
  data() {
    return {
      widgetName: 'Panel',
    };
  },
  methods: {
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
  },
};</script>
